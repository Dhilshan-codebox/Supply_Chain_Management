# agents/demand_agent.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from agents.base_agent import BaseSupplyChainAgent
from database import get_connection
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.holtwinters import ExponentialSmoothing

class DemandForecastingAgent(BaseSupplyChainAgent):
    def __init__(self):
        super().__init__(
            agent_id="demand_agent",
            role="Forecast customer demand across all SKUs using historical data and market indicators"
        )
        self.forecast_horizon = 90  # days

    def perceive(self, state: dict) -> dict:
        conn = get_connection()
        # Fetch last 90 days of sales orders
        orders_df = pd.read_sql_query(
            "SELECT sku, order_date, quantity FROM orders ORDER BY order_date ASC", 
            conn
        )
        # Fetch active SKUs
        skus_df = pd.read_sql_query("SELECT sku, name FROM inventory", conn)
        conn.close()

        # Parse date
        orders_df['order_date'] = pd.to_datetime(orders_df['order_date'])
        
        return {
            "orders": orders_df,
            "skus": skus_df.to_dict('records'),
            "market_growth_multiplier": state.get("overrides", {}).get("market_growth_multiplier", 1.05)
        }

    def decide(self, observations: dict) -> dict:
        orders_df = observations["orders"]
        skus = observations["skus"]
        market_mult = observations["market_growth_multiplier"]
        
        forecast_results = {}
        
        for sku_item in skus:
            sku = sku_item['sku']
            sku_orders = orders_df[orders_df['sku'] == sku].copy()
            
            if sku_orders.empty:
                # Fallback if no history
                dates = [datetime.utcnow().date() + timedelta(days=i) for i in range(1, self.forecast_horizon + 1)]
                forecast_results[sku] = [
                    {
                        "date": str(d),
                        "value": 10.0,
                        "lower": 5.0,
                        "upper": 15.0
                    }
                    for d in dates
                ]
                continue
            
            # Aggregate by date (just in case there are multiple entries)
            sku_daily = sku_orders.groupby('order_date')['quantity'].sum().reset_index()
            
            # Fill missing dates to make a continuous time series
            sku_daily.set_index('order_date', inplace=True)
            idx = pd.date_range(start=sku_daily.index.min(), end=sku_daily.index.max())
            sku_daily = sku_daily.reindex(idx, fill_value=0)
            
            # 1. Linear Regression Trend
            X = np.arange(len(sku_daily)).reshape(-1, 1)
            y = sku_daily['quantity'].values
            lr = LinearRegression()
            lr.fit(X, y)
            
            future_X = np.arange(len(sku_daily), len(sku_daily) + self.forecast_horizon).reshape(-1, 1)
            lr_pred = lr.predict(future_X)
            
            # 2. Exponential Smoothing (Holt-Winters or simple ES)
            try:
                # If there's enough data, use seasonal Holt-Winters
                if len(sku_daily) >= 14:
                    es = ExponentialSmoothing(
                        sku_daily['quantity'].astype(float),
                        trend='add',
                        seasonal='add',
                        seasonal_periods=7
                    ).fit(optimized=True)
                else:
                    es = ExponentialSmoothing(
                        sku_daily['quantity'].astype(float),
                        trend='add',
                        seasonal=None
                    ).fit(optimized=True)
                es_pred = es.forecast(self.forecast_horizon).values
            except Exception as e:
                # Fallback to simple rolling average
                self.logger.warning(f"Statsmodels ES failed for {sku}: {str(e)}. Falling back to rolling average.")
                rolling_avg = sku_daily['quantity'].rolling(7, min_periods=1).mean().iloc[-1]
                es_pred = np.full(self.forecast_horizon, rolling_avg)
            
            # Clean negative predictions
            lr_pred = np.clip(lr_pred, 0, None)
            es_pred = np.clip(es_pred, 0, None)
            
            # 3. Market/LLM sentiment adjusted forecast
            # Combining: 60% ES (captures seasonality), 30% Linear Trend (captures slope), 10% Market Growth
            ensemble_pred = (0.6 * es_pred + 0.3 * lr_pred) * market_mult
            
            # Clean final ensemble forecast values
            ensemble_pred = np.clip(ensemble_pred, 0, None)
            
            # Calculate simple confidence intervals (based on standard deviation of historical demand)
            std_dev = sku_daily['quantity'].std()
            if pd.isna(std_dev) or std_dev == 0:
                std_dev = 5.0
                
            forecast_results[sku] = []
            last_date = sku_daily.index.max()
            
            for i in range(self.forecast_horizon):
                future_date = (last_date + timedelta(days=i+1)).strftime("%Y-%m-%d")
                val = float(round(ensemble_pred[i], 2))
                # Confidence interval widens over time
                widening_factor = 1.0 + (i * 0.01)
                lower = float(round(max(0.0, val - 1.96 * std_dev * widening_factor), 2))
                upper = float(round(val + 1.96 * std_dev * widening_factor, 2))
                
                forecast_results[sku].append({
                    "date": future_date,
                    "value": val,
                    "lower": lower,
                    "upper": upper
                })
                
        return {"forecasts": forecast_results}

    def act(self, decision: dict, state: dict) -> bool:
        forecasts = decision["forecasts"]
        
        conn = get_connection()
        cursor = conn.cursor()
        
        try:
            # Clear old forecasts first to ensure fresh data
            cursor.execute("DELETE FROM demand_forecast")
            
            # Insert new forecasts
            for sku, daily_forecasts in forecasts.items():
                for f in daily_forecasts:
                    cursor.execute("""
                        INSERT OR REPLACE INTO demand_forecast (sku, forecast_date, forecast_value, confidence_lower, confidence_upper)
                        VALUES (?, ?, ?, ?, ?)
                    """, (sku, f['date'], f['value'], f['lower'], f['upper']))
                    
            conn.commit()
            self.logger.info(f"Forecasts written successfully for {len(forecasts)} SKUs.")
            
            # Update state with forecasts
            state["demand_forecast"] = forecasts
            return True
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Failed to save demand forecast to DB: {str(e)}")
            return False
        finally:
            conn.close()
