import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
  TextInput,
  StatusBar
} from 'react-native';

import { io } from 'socket.io-client';
import * as Linking from 'expo-linking';

const { width } = Dimensions.get('window');

/*
========================================
AVALON STEALTH PRO
SMART MONEY + WYCKOFF + M1 SIGNALS
========================================
*/

const BACKEND_URL = 'https://SEU-SERVIDOR.com';

const PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'AUD/USD',
  'BTC/USD',
  'ETH/USD',
  'BTC/USDT OTC',
  'EUR/USD OTC'
];

export default function App() {

  const socket = useRef(null);

  const [signals, setSignals] = useState([]);
  const [status, setStatus] = useState('Conectando...');
  const [selectedPair, setSelectedPair] = useState('BTC/USD');
  const [marketBias, setMarketBias] = useState('NEUTRO');
  const [countdown, setCountdown] = useState(60);
  const [btcPrice, setBtcPrice] = useState('0');
  const [analysis, setAnalysis] = useState([]);
  const [clock, setClock] = useState('');

  /*
  ========================================
  HORÁRIO BRASÍLIA
  ========================================
  */

  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
      });

      setClock(time);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /*
  ========================================
  SOCKET.IO
  ========================================
  */

  useEffect(() => {

    socket.current = io(BACKEND_URL);

    socket.current.on('connect', () => {
      setStatus('🟢 Online');
    });

    socket.current.on('marketData', (data) => {
      setBtcPrice(data.price);
      setMarketBias(data.bias);
    });

    socket.current.on('analysis', (data) => {
      setAnalysis(data);
    });

    socket.current.on('signal', (signal) => {

      setSignals(prev => [
        signal,
        ...prev.slice(0, 30)
      ]);

      startCountdown();
    });

    return () => {
      socket.current?.disconnect();
    };

  }, []);

  /*
  ========================================
  COUNTDOWN M1
  ========================================
  */

  const startCountdown = () => {

    let seconds = 60;

    setCountdown(seconds);

    const interval = setInterval(() => {

      seconds--;

      setCountdown(seconds);

      if (seconds <= 0) {
        clearInterval(interval);
      }

    }, 1000);
  };

  /*
  ========================================
  ABRIR AVALON
  ========================================
  */

  const openAvalon = () => {
    Linking.openURL(
      'https://app.avalon.com.br/trade/BTCBRL'
    );
  };

  /*
  ========================================
  TROCAR PAR
  ========================================
  */

  const selectPair = (pair) => {

    setSelectedPair(pair);

    socket.current.emit('changePair', pair);
  };

  /*
  ========================================
  CARD DE SINAL
  ========================================
  */

  const SignalCard = ({ signal }) => {

    const isBuy = signal.signal === 'BUY';
    const isSell = signal.signal === 'SELL';

    return (

      <View style={[
        styles.signalCard,
        {
          borderColor: isBuy
            ? '#10b981'
            : isSell
            ? '#ef4444'
            : '#f59e0b'
        }
      ]}>

        <Text style={styles.signalType}>
          {isBuy
            ? '🟢 COMPRA'
            : isSell
            ? '🔴 VENDA'
            : '⚠️ EVITAR'}
        </Text>

        <Text style={styles.signalPair}>
          {signal.pair}
        </Text>

        <Text style={styles.signalPrice}>
          ${signal.price}
        </Text>

        <Text style={styles.signalInfo}>
          ⏰ Entrada: {signal.entryTime}
        </Text>

        <Text style={styles.signalInfo}>
          ⌛ Expiração: {signal.expiration}
        </Text>

        <Text style={styles.signalInfo}>
          🎯 Confiança: {signal.confidence}%
        </Text>

        <Text style={styles.signalInfo}>
          📊 Estratégia: {signal.strategy}
        </Text>

        <Text style={styles.signalInfo}>
          📈 Smart Money: {signal.smartmoney}
        </Text>

        <Text style={styles.signalInfo}>
          🧠 Wyckoff: {signal.wyckoff}
        </Text>

        <Text style={styles.signalInfo}>
          🇧🇷 Brasília: {signal.timestamp}
        </Text>

        <TouchableOpacity
          style={styles.tradeButton}
          onPress={openAvalon}
        >
          <Text style={styles.tradeButtonText}>
            🚀 OPERAR
          </Text>
        </TouchableOpacity>

      </View>
    );
  };

  /*
  ========================================
  INTERFACE
  ========================================
  */

  return (

    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="light-content"
      />

      <ScrollView>

        <View style={styles.header}>

          <Text style={styles.logo}>
            🛡️ AVALON STEALTH PRO
          </Text>

          <Text style={styles.status}>
            {status}
          </Text>

          <Text style={styles.clock}>
            🇧🇷 {clock}
          </Text>

        </View>

        <View style={styles.marketBox}>

          <Text style={styles.marketText}>
            📈 Ativo: {selectedPair}
          </Text>

          <Text style={styles.marketText}>
            💰 Preço: {btcPrice}
          </Text>

          <Text style={styles.marketText}>
            📊 Bias: {marketBias}
          </Text>

          <Text style={styles.marketText}>
            ⏱ M1 Countdown: {countdown}s
          </Text>

        </View>

        <Text style={styles.sectionTitle}>
          🔍 PARES DISPONÍVEIS
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pairContainer}
        >

          {PAIRS.map((pair, index) => (

            <TouchableOpacity
              key={index}
              style={[
                styles.pairButton,
                selectedPair === pair &&
                styles.activePair
              ]}
              onPress={() => selectPair(pair)}
            >

              <Text style={styles.pairText}>
                {pair}
              </Text>

            </TouchableOpacity>

          ))}

        </ScrollView>

        <Text style={styles.sectionTitle}>
          🧠 ANÁLISE INSTITUCIONAL
        </Text>

        <View style={styles.analysisBox}>

          <Text style={styles.analysisText}>
            ✔ Smart Money Concepts
          </Text>

          <Text style={styles.analysisText}>
            ✔ Liquidity Sweeps
          </Text>

          <Text style={styles.analysisText}>
            ✔ BOS / CHoCH
          </Text>

          <Text style={styles.analysisText}>
            ✔ Wyckoff
          </Text>

          <Text style={styles.analysisText}>
            ✔ Order Blocks
          </Text>

          <Text style={styles.analysisText}>
            ✔ Fair Value Gaps
          </Text>

          <Text style={styles.analysisText}>
            ✔ Fluxo Institucional
          </Text>

          <Text style={styles.analysisText}>
            ✔ Operações M1
          </Text>

        </View>

        <Text style={styles.sectionTitle}>
          🚨 SINAIS AO VIVO
        </Text>

        <FlatList
          scrollEnabled={false}
          data={signals}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <SignalCard signal={item} />
          )}
        />

      </ScrollView>

    </SafeAreaView>
  );
}

/*
========================================
STYLES
========================================
*/

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#020617'
  },

  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#0f172a'
  },

  logo: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold'
  },

  status: {
    color: '#22c55e',
    marginTop: 10,
    fontSize: 16
  },

  clock: {
    color: '#cbd5e1',
    marginTop: 5
  },

  marketBox: {
    backgroundColor: '#111827',
    margin: 10,
    borderRadius: 20,
    padding: 20
  },

  marketText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8
  },

  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 20,
    marginBottom: 10
  },

  pairContainer: {
    paddingLeft: 10
  },

  pairButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginRight: 10
  },

  activePair: {
    backgroundColor: '#2563eb'
  },

  pairText: {
    color: 'white',
    fontWeight: 'bold'
  },

  analysisBox: {
    backgroundColor: '#111827',
    margin: 10,
    borderRadius: 20,
    padding: 20
  },

  analysisText: {
    color: '#cbd5e1',
    marginBottom: 10,
    fontSize: 15
  },

  signalCard: {
    backgroundColor: '#111827',
    margin: 10,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2
  },

  signalType: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },

  signalPair: {
    color: '#38bdf8',
    fontSize: 18,
    marginTop: 8
  },

  signalPrice: {
    color: 'white',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 10
  },

  signalInfo: {
    color: '#cbd5e1',
    marginTop: 6,
    fontSize: 15
  },

  tradeButton: {
    backgroundColor: '#10b981',
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center'
  },

  tradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }

});
