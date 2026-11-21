//+------------------------------------------------------------------+
//| ScalpingDemo.mq5                                                  |
//| Asesor Experto para MetaTrader 5 con las mismas 4 estrategias     |
//| que bot-scalping (Python). Pruébalo SIEMPRE primero en el         |
//| Probador de Estrategias y en una cuenta DEMO.                     |
//+------------------------------------------------------------------+
#property copyright "bot-scalping"
#property version   "1.00"
#property strict

#include <Trade/Trade.mqh>

enum ENUM_ESTRATEGIA
  {
   CRUCE_EMA = 0,        // Cruce de EMAs
   REBOTE_BOLLINGER = 1, // Rebote en bandas de Bollinger + RSI
   RUPTURA = 2,          // Ruptura de máximo/mínimo con volumen
   REVERSION_VWAP = 3    // Reversión a VWAP móvil (z-score)
  };

input ENUM_ESTRATEGIA Estrategia      = REBOTE_BOLLINGER;
input ENUM_TIMEFRAMES MarcoTemporal   = PERIOD_M1;
input bool            PermitirCortos  = true;
// Parámetros de las estrategias
input int    EmaRapida   = 9;
input int    EmaLenta    = 34;
input int    BB_Periodo  = 20;
input double BB_Desv     = 2.5;
input int    RSI_Limite  = 20;    // compra si RSI(7) < límite; vende si > 100-límite
input int    Ruptura_N   = 30;
input double Ruptura_Vol = 2.5;   // volumen > X veces la media
input int    VWAP_N      = 60;
input double VWAP_Z      = 2.5;
// Salidas
input double ObjetivoPct = 0.40;  // % de ganancia para cerrar
input double StopPct     = 0.40;  // % de pérdida para cerrar
input int    MaxVelas    = 30;    // cierre por tiempo
// Riesgo
input double Lote             = 0.01; // tamaño fijo (0.01 = micro lote)
input double PerdidaMaxDiaPct = 20.0; // deja de abrir si pierde este % del saldo en el día
input long   NumeroMagico     = 520501;

CTrade   trade;
int      hEmaR, hEmaL, hBB, hRSI;
datetime ultimaVela = 0;
datetime aperturaPos = 0;
double   saldoInicioDia = 0;
int      diaActual = -1;

int OnInit()
  {
   trade.SetExpertMagicNumber(NumeroMagico);
   hEmaR = iMA(_Symbol, MarcoTemporal, EmaRapida, 0, MODE_EMA, PRICE_CLOSE);
   hEmaL = iMA(_Symbol, MarcoTemporal, EmaLenta, 0, MODE_EMA, PRICE_CLOSE);
   hBB   = iBands(_Symbol, MarcoTemporal, BB_Periodo, 0, BB_Desv, PRICE_CLOSE);
   hRSI  = iRSI(_Symbol, MarcoTemporal, 7, PRICE_CLOSE);
   if(hEmaR == INVALID_HANDLE || hEmaL == INVALID_HANDLE || hBB == INVALID_HANDLE || hRSI == INVALID_HANDLE)
      return INIT_FAILED;
   saldoInicioDia = AccountInfoDouble(ACCOUNT_BALANCE);
   PrintFormat("ScalpingDemo iniciado en %s. Cuenta %s.", _Symbol,
               AccountInfoInteger(ACCOUNT_TRADE_MODE) == ACCOUNT_TRADE_MODE_DEMO ? "DEMO" : "REAL");
   return INIT_SUCCEEDED;
  }

double Valor(int handle, int buffer, int shift)
  {
   double v[];
   if(CopyBuffer(handle, buffer, shift, 1, v) != 1) return EMPTY_VALUE;
   return v[0];
  }

// +1 compra, -1 venta, 0 nada. Se evalúa con la vela ya cerrada (shift 1).
int Senal()
  {
   double c1 = iClose(_Symbol, MarcoTemporal, 1);
   if(Estrategia == CRUCE_EMA)
     {
      double r1 = Valor(hEmaR, 0, 1), l1 = Valor(hEmaL, 0, 1), r2 = Valor(hEmaR, 0, 2), l2 = Valor(hEmaL, 0, 2);
      if(r1 > l1 && r2 <= l2) return 1;
      if(r1 < l1 && r2 >= l2) return -1;
     }
   else if(Estrategia == REBOTE_BOLLINGER)
     {
      double sup = Valor(hBB, 1, 1), inf = Valor(hBB, 2, 1), rsi = Valor(hRSI, 0, 1);
      if(c1 < inf && rsi < RSI_Limite) return 1;
      if(c1 > sup && rsi > 100 - RSI_Limite) return -1;
     }
   else if(Estrategia == RUPTURA)
     {
      int iMax = iHighest(_Symbol, MarcoTemporal, MODE_HIGH, Ruptura_N, 2);
      int iMin = iLowest(_Symbol, MarcoTemporal, MODE_LOW, Ruptura_N, 2);
      double maximo = iHigh(_Symbol, MarcoTemporal, iMax), minimo = iLow(_Symbol, MarcoTemporal, iMin);
      double volMedio = 0;
      for(int i = 2; i < Ruptura_N + 2; i++) volMedio += (double)iTickVolume(_Symbol, MarcoTemporal, i);
      volMedio /= Ruptura_N;
      bool volOk = (double)iTickVolume(_Symbol, MarcoTemporal, 1) > Ruptura_Vol * volMedio;
      if(volOk && c1 > maximo) return 1;
      if(volOk && c1 < minimo) return -1;
     }
   else if(Estrategia == REVERSION_VWAP)
     {
      // VWAP móvil con volumen de ticks y z-score de la distancia
      double pv = 0, v = 0, difs[];
      ArrayResize(difs, VWAP_N);
      for(int i = 1; i <= VWAP_N; i++)
        {
         double tp = (iHigh(_Symbol, MarcoTemporal, i) + iLow(_Symbol, MarcoTemporal, i) + iClose(_Symbol, MarcoTemporal, i)) / 3.0;
         double vol = (double)iTickVolume(_Symbol, MarcoTemporal, i);
         pv += tp * vol; v += vol;
        }
      if(v <= 0) return 0;
      double vwap = pv / v, media = 0, var = 0;
      for(int i = 0; i < VWAP_N; i++) { difs[i] = iClose(_Symbol, MarcoTemporal, i + 1) - vwap; media += difs[i]; }
      media /= VWAP_N;
      for(int i = 0; i < VWAP_N; i++) var += MathPow(difs[i] - media, 2);
      double sd = MathSqrt(var / (VWAP_N - 1));
      if(sd <= 0) return 0;
      double z = (c1 - vwap) / sd;
      if(z < -VWAP_Z) return 1;
      if(z > VWAP_Z) return -1;
     }
   return 0;
  }

bool TengoPosicion(ulong &ticket)
  {
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong t = PositionGetTicket(i);
      if(PositionSelectByTicket(t) && PositionGetString(POSITION_SYMBOL) == _Symbol && PositionGetInteger(POSITION_MAGIC) == NumeroMagico)
        { ticket = t; return true; }
     }
   return false;
  }

void OnTick()
  {
   MqlDateTime ahora;
   TimeCurrent(ahora);
   if(ahora.day_of_year != diaActual) { diaActual = ahora.day_of_year; saldoInicioDia = AccountInfoDouble(ACCOUNT_BALANCE); }

   datetime vela = iTime(_Symbol, MarcoTemporal, 0);
   if(vela == ultimaVela) return; // una decisión por vela cerrada
   ultimaVela = vela;

   ulong ticket;
   if(TengoPosicion(ticket))
     {
      // El objetivo y el stop están en el servidor; aquí solo el cierre por tiempo
      int velas = iBarShift(_Symbol, MarcoTemporal, aperturaPos);
      if(aperturaPos > 0 && velas >= MaxVelas) trade.PositionClose(ticket);
      return;
     }

   double perdidaDia = saldoInicioDia - AccountInfoDouble(ACCOUNT_EQUITY);
   if(perdidaDia >= saldoInicioDia * PerdidaMaxDiaPct / 100.0) return;

   int s = Senal();
   if(s == 0 || (s < 0 && !PermitirCortos)) return;

   int dig = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   if(s > 0)
     {
      double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
      double tp = NormalizeDouble(ask * (1 + ObjetivoPct / 100.0), dig), sl = NormalizeDouble(ask * (1 - StopPct / 100.0), dig);
      if(trade.Buy(Lote, _Symbol, ask, sl, tp, "scalping")) aperturaPos = vela;
     }
   else
     {
      double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
      double tp = NormalizeDouble(bid * (1 - ObjetivoPct / 100.0), dig), sl = NormalizeDouble(bid * (1 + StopPct / 100.0), dig);
      if(trade.Sell(Lote, _Symbol, bid, sl, tp, "scalping")) aperturaPos = vela;
     }
  }
//+------------------------------------------------------------------+
