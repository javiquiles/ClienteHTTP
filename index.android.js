/* Importaciones */
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  ListView,
  TouchableHighlight,
  TextInput,
  Alert,
  Share
} from 'react-native';

import {
  StackNavigator,
  NavigationActions
} from 'react-navigation';


import { Col, Row, Grid } from "react-native-grid-layout";


/* Componente */
export default class MainScreen extends Component {
  state: any;
  constructor() {
    super()

    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2});
    var articulos = [];
    this._shareMessage = this._shareMessage.bind(this);

    this.state = {
      dataSource: ds.cloneWithRows([]),
      search: ''
    }
  }
  componentDidMount() {
    fetch('http://192.168.224.12:5556/api/articulos')
      .then((response) => response.json())
      .then((responseJson) => {   
        articulos = responseJson;

        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(articulos)
        })
      })
      .catch((error) => {
        console.error(error);
      });
  }
  filterSearch(search) {
    const newData = articulos.filter(function(item) {
      const itemData = item.Nombre.toUpperCase()
      const textData = search.toUpperCase()
      return itemData.indexOf(textData) > -1
    })
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(newData),
      search: search
    })
  }
  deleteArticulo(id) {
    fetch('http://192.168.224.12:5556/api/articulos/' + id, {
      method: 'DELETE',
    })
    .catch((error) => {
      console.error(error);
    });
    this.props.navigation.dispatch(resetAction)
  }
  _shareMessage() {
    var lista = '';
    for (var x = 0; x < articulos.length; x++) {
      lista = lista + articulos[x].Nombre + ' ' + articulos[x].Descripcion + ' $' + articulos[x].Precio + '\n';
    }

    Share.share({
      message: lista
    })
    .catch((error) => this.setState({result: 'error: ' + error.message}));
  }
  render() {
    return (
      <View style={styles.container}>
        <TextInput 
          style={styles.search}
          onChangeText={(text) => this.filterSearch(text)}
          value={this.state.text}
          placeholder="Buscar..."
          underlineColorAndroid='transparent'
        />
        <ListView
          enableEmptySections={true} //Indica que puede estar vacio.
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
        />
        <Row>
          <Col style={{alignItems: 'flex-start', justifyContent: 'flex-end'}}>
            <TouchableHighlight 
              style={styles.btnShare} 
              onPress={this._shareMessage}
              underlayColor='transparent'
            >
              <Text style={styles.textShare}>Compartir</Text>
            </TouchableHighlight>
          </Col>
          <Col style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
            <TouchableHighlight 
              style={styles.btnMas} 
              onPress={() => {this.props.navigation.navigate('New')}}
              underlayColor='blue'
            >
              <Text style={styles.textMas}>+</Text>
            </TouchableHighlight>
          </Col>
        </Row>
      </View>
    );
  }
  renderRow(dataRow) {
    return (
      <TouchableHighlight 
        onPress={() => { Alert.alert(
          'Acciones',
          '¿Desea eliminar articulo?',
          [
            { text: 'Si', onPress: () => {this.deleteArticulo(dataRow.Id)} },
            { text: 'No' },
          ]
        )}}
        underlayColor='#cccccc'
      >
        <View style={styles.cell}>
          <Row>
            <Col style={{alignItems: 'center'}}><Text style={styles.text}>{dataRow.Nombre}</Text></Col>
            <Col style={{alignItems: 'center'}}><Text style={styles.text}>{dataRow.Descripcion}</Text></Col>
            <Col style={{alignItems: 'center'}}><Text style={styles.text}>{dataRow.Precio}</Text></Col>
          </Row>
        </View>
      </TouchableHighlight>
    )
  }
}

export class NewScreen extends Component {
  constructor() {
    super()

    this.state = {
      nombre: '',
      descripcion: '',
      precio: '',
      rubro: '',
    }
  }
  changeNombre(nombre) {
    this.setState({nombre: nombre})
  }
  changeDescripcion(descripcion) {
    this.setState({descripcion: descripcion})
  }
  changePrecio(precio) {
    this.setState({precio: precio})
  }
  changeRubro(rubro) {
    this.setState({rubro: rubro})
  }
  addArticulo(visible) {
    fetch('http://192.168.224.12:5556/api/articulos', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Nombre: this.state.nombre,
        Descripcion: this.state.descripcion,
        Precio: this.state.precio,
        IdRubro: this.state.rubro,
      })
    })
    .catch((error) => {
      console.error(error);
    });
    this.props.navigation.dispatch(resetAction)
  }
  render() {
    return (
      <View style={[styles.container, styles.containerNew]}>
        <TextInput 
          style={[styles.input, styles.nombre]}
          value={this.state.nombre}
          placeholder="Nombre"
          onChangeText={(nombre) => this.changeNombre(nombre)}
        />
        <TextInput 
          style={[styles.input, styles.textArea]}
          value={this.state.descripcion}
          placeholder="Descripcion"
          onChangeText={(descripcion) => this.changeDescripcion(descripcion)}
        />
        <TextInput 
          style={styles.input}
          value={this.state.precio}
          placeholder="Precio"
          onChangeText={(precio) => this.changePrecio(precio)}
        />
        <TextInput 
          style={styles.input}
          value={this.state.rubro}
          placeholder="Rubro"
          onChangeText={(rubro) => this.changeRubro(rubro)}
        />
        <TouchableHighlight 
          style={styles.btnAgregar} 
          onPress={() => {this.addArticulo()}}
          underlayColor='blue'
        >
          <Text style={styles.textAgregar}>Agregar</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const ClienteHTTP = StackNavigator({
  Main: {
    screen: MainScreen,
    navigationOptions: {
      title: 'Articulos',
      headerStyle: {
        backgroundColor: '#2196F3',
      },
      headerTintColor: 'white',
    },
  },
  New: {
    screen: NewScreen,
    navigationOptions: {
      title: 'Nuevo Articulo',
      headerStyle: {
        backgroundColor: '#2196F3',
      },
      headerTintColor: 'white',
    },
  },
});

const resetAction = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Main'})
  ]
});

/* Estilos */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  cell: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingTop: 15,
    paddingBottom: 15,
  },
  search: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 15,
    paddingLeft: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  text: {
    color: '#000'
  },
  btnMas: {
    width: 50,
    height: 50,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginRight: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#2196F3'
  },
  textMas: {
    color: 'white',
    fontSize: 25
  },
  btnAgregar: {
    height: 40,
    backgroundColor: '#2196F3',
    marginTop: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15
  },
  textAgregar: {
    color: 'white',
    fontSize: 15
  },
  btnShare: {
    padding: 15,
    marginLeft: 5,
    marginBottom: 10
  },
  textShare: {
    color: 'blue',
  },
  input: {
    marginHorizontal: 10,
    marginTop: 10,
    paddingBottom: 15,
    fontSize: 15
  },
  nombre: {
    marginTop: 15
  }
});

AppRegistry.registerComponent('ClienteHTTP', () => ClienteHTTP);