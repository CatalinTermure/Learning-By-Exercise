import React, { Component } from "react";
import { StyleSheet, FlatList, Text, View, ToolbarAndroid, StatusBar, TouchableOpacity, Image, Button, ActivityIndicator, TextInput, Alert } from "react-native";
import {createStackNavigator, createAppContainer, NavigationEvents, createDrawerNavigator, createSwitchNavigator } from 'react-navigation';

async function selectIntrebari(materie, isConstructed = true) {
  if(isConstructed) {
    this.setState({animating: true});
  }
  fetch("https://cataphonedb1.000webhostapp.com/Select.php", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( {
      subject: materie,
    })
  }).then( (response) => response.json()).then( (responseJson) => {
    let aux = [];
    responseJson.forEach((item) => { aux.push({ key: item[0], text: item[2], rez: item[3] }) });
    this.setState({animating: false, questions: aux});
  }).catch((error) => {});
  return true;
}

function InsertIntrebare(subject, content, solution) {
  fetch("https://cataphonedb1.000webhostapp.com/Insert.php", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( {
      subject: subject,
      content: content,
      solution: solution,
    })
  }).catch((error) => { alert(error); });
  alert("Intrebarea a fost adaugata!");
}

async function DeleteQuestion(id) {
  fetch("https://cataphonedb1.000webhostapp.com/Delete.php", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( {
      id: id,
    })
  }).catch((error) => { alert(error); });
  return true;
}

class MainActivity extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      Materii: [
        { img: require("./assets/Mate.png"), key: "Matematica" },
        { img: require("./assets/Info.png"), key: "Informatica" },
        { img: require("./assets/Fizica.png"), key: "Fizica" },
        { img: require("./assets/Romana.png"), key: "Limba romana" },
        { img: require("./assets/Engleza.png"), key: "Limba engleza" },
        { img: require("./assets/Franceza.png"), key: "Limba franceza" },
        { img: require("./assets/Biologie.png"), key: "Biologie" },
        { img: require("./assets/Chimie.png"), key: "Chimie" },
        { img: require("./assets/Istorie.png"), key: "Istorie" },
        { img: require("./assets/Geografie.png"), key: "Geografie" },
        { img: require("./assets/Muzica.png"), key: "Muzica" },
        { img: require("./assets/Desen.png"), key: "Desen" },
      ]
    }
  }

  static navigationOptions = {
    title: 'Learning by exercise',
    headerStyle: {
      backgroundColor: '#f4511e',
      height: 40,
    },
  };

  render() {
    return (
      <View style={styles.mainViewStyle}>
        <StatusBar hidden={false} translucent={false} />
        <FlatList 
          style={styles.flatListStyle}
          data={this.state.Materii}
          columnWrapperStyle={styles.rowStyle}
          renderItem={ ({item}) =>
            <View style={styles.cellContainer}>
              <TouchableOpacity style={styles.cellContainer} 
                onPress={() => { 
                  this.props.navigation.navigate('Questions', { title: item.key }); }
                  }>
                <Image style={styles.cellImage} resizeMode="stretch" source={item.img} />
                <Text> {item.key} </Text>
              </TouchableOpacity>
            </View> } 
          numColumns={3} />
      </View>
    );
  }
}

var boundSelect;


class QuestionActivity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      animating: true,
      questions: [],
    }

    boundSelect = selectIntrebari.bind(this);

    boundSelect(this.props.navigation.getParam('title', 'nya'), false);
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('title', 'NYA'),
      headerStyle: {
        backgroundColor: '#f4511e',
        height: 40,
      },
    };
  };

  renderLoading() {
    return (
      <View style={{backgroundColor: "lightgrey", flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator style={styles.loadingStyle}
          animating={true}
          size="large"
          color="blue"
        />
        <Text> Se incarca intrebarile... </Text>
      </View>
    );
  }

  DeleteData(id) {
    for(var i = 0; i < this.state.questions.length; i++) {
      if(this.state.questions[i].key == id) {
        this.state.questions.splice(i, 1);
        this.setState({animating: true});
        setTimeout(() => {
          this.setState({animating: false});
        }, 500);
        return;
      }
    }
  }

  renderQuestions() {
    return (
      <View style={styles.mainViewStyle}>
        <NavigationEvents
          onWillFocus={(payload) => boundSelect(this.props.navigation.getParam('title', 'NYA'))}
        />
        <FlatList 
          style={styles.flatListStyle}
          data={this.state.questions}
          renderItem={ ({item}) =>
            <View style={styles.questionContainer}>
              <TouchableOpacity style={styles.questionStyle} 
                onPress={() => { 
                  Alert.alert(
                    "Vizualizati raspunsul",
                    "Sunteti sigur ca doriti sa vizualizati raspunsul?",
                    [
                      { text: "Da", onPress:() => {this.props.navigation.navigate('Solutions', {text: item.rez})}},
                      { text: "Nu" }
                    ],
                    {cancelable: false},
                  );
                } }
                onLongPress={() => {
                  Alert.alert(
                    "Stergeti intrebarea",
                    "Sunteti sigur ca doriti sa stergeti intrebarea?",
                    [
                      { text: "Da", onPress:() => {this.DeleteData(item.key); DeleteQuestion(item.key)}},
                      { text: "Nu" }
                    ],
                    {cancelable: false},
                  );
                } }>
                <Text> {item.text} </Text>
              </TouchableOpacity>
            </View> } 
          numColumns={1} />
        <TouchableOpacity 
          onPress={() => {
            this.props.navigation.navigate('AddQuestions', {title: this.props.navigation.getParam('title', 'NYA')} );
          }}
        style={styles.floatingButtonStyle}><Text style={{fontSize: 50, color: 'white', paddingBottom: 5}}> + </Text></TouchableOpacity>
      </View>
    );
  }

  render() {
    if(this.state.animating) {
      return this.renderLoading();
    }
    else {
      return this.renderQuestions();
    }
  }
}

class AddQuestionActivity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      question: "",
      solution: "",
    }
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: "Adauga o intrebare",
      headerStyle: {
        backgroundColor: '#f4511e',
        height: 40,
      },
    };
  };

  render() { 
    return (
      <View style={styles.addQuestionViewStyle}>
        <TextInput 
          style={{flex: 1}}
          placeholder="Introdu textul intrebarii"
          onChangeText={(text) => {this.setState({question: text})}}
          multiline={true}
        />
        <TextInput 
          style={{flex: 1, marginBottom: 150}}
          placeholder="Introdu solutia"
          onChangeText={(text) => {this.setState({solution: text})}}
          multiline={true}
        />
        <Button style={styles.testButtonStyle} title="Adauga intrebare" onPress={() => {
          InsertIntrebare(this.props.navigation.getParam('title', 'Nya'), this.state.question, this.state.solution)}} />
      </View>
    );
  }

}

class SolutionActivity extends Component {
  constructor(props) {
    super(props);
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: "Solutia intrebarii",
      headerStyle: {
        backgroundColor: '#f4511e',
        height: 40,
      },
    };
  };

  render() {
    return (
      <View style={styles.addQuestionViewStyle}>
        <Text> {this.props.navigation.getParam('text', "??????")} </Text>
      </View>
    )
  }
}

class ProfileDrawer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View>
        <Button style={styles.testButtonStyle}
          onPress = {() => {}}
          title="Go hard, go home"
        />
      </View>
    );
  }
}

const MainNavigator = createStackNavigator( {
  Home: {screen: MainActivity },
  Questions: {screen: QuestionActivity },
  AddQuestions: {screen: AddQuestionActivity},
  Solutions: {screen: SolutionActivity},
});

const App = createAppContainer(MainNavigator);

export default App;

const styles = StyleSheet.create({
  mainViewStyle: {
    flex: 1,
    backgroundColor: "white",
  },
  cellContainer: {
    height: 110,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 20,
    marginTop: 8,
  },
  cellImage: {
    height: 90,
    width: 90,
  },
  rowStyle: {
    justifyContent: 'space-evenly',
  },
  testButtonStyle: {
    flex: 1,
    width: 300,
    marginBottom: 100,
  },
  loadingStyle: {
    alignSelf: 'center',
  },
  flatListStyle: {
    marginTop: 10,
    paddingBottom: 100,
  },
  questionContainer: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 20,
    marginTop: 8,
    backgroundColor: 'lightgrey',
  },
  questionStyle: {
    height: 200,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    flex: 1,
    marginTop: 8,
    marginLeft: 8,
    marginRight: 8,
  },
  floatingButtonStyle: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addQuestionViewStyle: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  icon: {
    width: 30,
    height: 30,
  }
});