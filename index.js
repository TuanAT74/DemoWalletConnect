/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
if (typeof BigInt === 'undefined') global.BigInt = require('big-integer');

AppRegistry.registerComponent(appName, () => App);
