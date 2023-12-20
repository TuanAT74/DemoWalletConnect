/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  WalletConnectModal,
  useWalletConnectModal,
} from '@walletconnect/modal-react-native';
import {numberToHex, sanitizeHex, utf8ToHex} from '@walletconnect/encoding';
import {RequestModal} from './app/components/RequestModal';
import {useNetInfo} from '@react-native-community/netinfo';

const PROJECT_ID = '6399bd1820573cde76cdbbf7c22dc0d7';

const clientMeta = {
  name: 'BluePrint_Dev',
  description: 'RN dApp by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'nxdsns://',
  },
};

export const sessionParams = {
  namespaces: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'wallet_addEthereumChain',
      ],
      chains: ['eip155:1'],
      events: ['chainChanged', 'accountsChanged'],
      rpcMap: {},
    },
  },
};

const App = () => {
  const netInfo = useNetInfo();
  const {isConnected, provider, open} = useWalletConnectModal();
  const [modalVisible, setModalVisible] = useState(false);
  const [rpcResponse, setRpcResponse] = useState();
  const [loading, setLoading] = useState(false);

  const onConnect = () => {
    if (isConnected) {
      provider?.disconnect();
    } else {
      try {
        open();
        provider.enable().then(providerAccounts => {
          console.log(
            '📢[DonationModal.js:99]: providerAccounts: ',
            providerAccounts,
          );
        });
      } catch (error) {
        console.log('📢[DonationModal.js:103]: error: ', error);
      }
    }
  };

  const onResponse = response => {
    setRpcResponse(response);
    setLoading(false);
  };

  const onModalClose = () => {
    setModalVisible(false);
    setLoading(false);
    setRpcResponse(undefined);
  };

  const onAction = callback => async () => {
    try {
      setLoading(true);
      setModalVisible(true);
      const response = await callback();
      onResponse(response);
    } catch (error) {
      onResponse({
        error: error?.message || 'error',
      });
    }
  };

  const onSendTransaction = async () => {
    try {
      if (!provider) {
        console.log('Provider is not available.');
        return;
      }

      const chainId = await provider.request({
        method: 'eth_chainId',
      });
      console.log('chainId: ', chainId);

      const amount = 10;
      console.log('amount: ', amount);

      const accounts = await provider?.request({
        method: 'eth_accounts',
      });
      console.log('accounts: ', accounts);

      if (!accounts) {
        console.log('account is not available.');
        return;
      }

      const address = accounts[0];
      const tokenAddress = '0x228b5C21ac00155cf62c57bcc704c0dA8187950b';
      const recipientAddress = '0x3d564e587F184ff6De6898D0A85344a52743f959';
      const contractData = '0xa9059cbb';

      const value =
        '0x' +
        BigInt(amount * 1e18)
          .toString(16)
          .padStart(64, '0');

      const data =
        contractData +
        '000000000000000000000000' +
        recipientAddress.substring(2) +
        value.substring(2);

      console.log('data: ', data);
      const transaction = {
        from: address,
        to: tokenAddress, //nxd
        value: '0x0',
        chainId,
        data,
      };

      const txResponse = await provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });
      console.log('txResponse: ', txResponse);

      return {
        method: 'send transaction',
        result: txResponse,
      };
    } catch (error) {
      console.log('error: ', error);
    }
  };

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}>
      <TouchableOpacity
        onPress={onConnect}
        style={{
          ...styles.button,
        }}>
        <Text style={{color: 'white'}}>
          {isConnected ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, !isConnected && styles.buttonDisabled]}
        disabled={!isConnected}
        onPress={onAction(onSendTransaction)}>
        <Text style={styles.buttonText}>Send Transaction</Text>
      </TouchableOpacity>
      <WalletConnectModal
        projectId={PROJECT_ID}
        providerMetadata={clientMeta}
        sessionParams={sessionParams}
        accentColor="#9090FF"
      />
      <RequestModal
        isVisible={modalVisible}
        onClose={onModalClose}
        isLoading={loading}
        rpcResponse={rpcResponse}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3396FF',
    borderRadius: 20,
    width: 200,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
});

export default App;
