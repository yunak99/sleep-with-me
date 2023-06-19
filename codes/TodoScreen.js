import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoScreen = ({ navigation }) => {
  const [date, setDate] = useState('');
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [editingTodoId, setEditingTodoId] = useState('');
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    loadTodos();
    setCurrentDate(getFormattedDate());
  }, []);

  useEffect(() => {
    saveTodos();
  }, [todos, completedTodos]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: null,
    });
  }, []);

  const handleAddTodo = () => {
    if (date === '') {
      return;
    }

    const newTodo = {
      id: Date.now().toString(),
      text: date,
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setDate('');
  };

  const handleToggleTodo = (id) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });

    const updatedCompletedTodos = updatedTodos.filter((todo) => todo.completed);

    setTodos(updatedTodos);
    setCompletedTodos(updatedCompletedTodos);
  };

  const handleDeleteTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    const updatedCompletedTodos = updatedTodos.filter((todo) => todo.completed);

    setTodos(updatedTodos);
    setCompletedTodos(updatedCompletedTodos);
  };

  const handleEditTodo = (id, text) => {
    setEditingTodoId(id);
    setEditedText(text);
  };

  const handleSaveEdit = () => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === editingTodoId) {
        return { ...todo, text: editedText };
      }
      return todo;
    });

    setTodos(updatedTodos);
    setEditingTodoId('');
    setEditedText('');
  };

  const handleCancelEdit = () => {
    setEditingTodoId('');
    setEditedText('');
  };

  const handleResetTodos = () => {
    setTodos([]);
    setCompletedTodos([]);
  };

  const saveTodos = async () => {
    try {
      const jsonValue = JSON.stringify(todos);
      await AsyncStorage.setItem('todos', jsonValue);

      const completedJson = JSON.stringify(completedTodos);
      await AsyncStorage.setItem('completedTodos', completedJson);
    } catch (error) {
      console.error('Error saving todos', error);
    }
  };

  const loadTodos = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('todos');
      const loadedTodos = JSON.parse(jsonValue);

      const completedJson = await AsyncStorage.getItem('completedTodos');
      const loadedCompletedTodos = JSON.parse(completedJson);

      if (loadedTodos) {
        setTodos(loadedTodos);
      }

      if (loadedCompletedTodos) {
        setCompletedTodos(loadedCompletedTodos);
      }
    } catch (error) {
      console.error('Error loading todos', error);
    }
  };

  const getFormattedDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    const day = ('0' + currentDate.getDate()).slice(-2);
    return `${year}. ${month}. ${day}`;
    };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.headerText}>{currentDate}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="오늘의 할 일은 무엇인가요?"
          value={date}
          onChangeText={(text) => setDate(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
          <Text style={styles.buttonText}>Add Todo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.todoList}>
        {todos.map((todo) => (
          <View style={styles.todoItem} key={todo.id}>
            <TouchableOpacity onPress={() => handleToggleTodo(todo.id)}>
              <Ionicons
                name={todo.completed ? 'ios-checkbox-outline' : 'ios-square-outline'}
                size={24}
                color={todo.completed ? '#008080' : '#808080'}
                style={styles.checkbox}
              />
            </TouchableOpacity>

            {editingTodoId === todo.id ? (
              <TextInput
                style={styles.todoText}
                value={editedText}
                onChangeText={(text) => setEditedText(text)}
                autoFocus
              />
            ) : (
              <Text
                style={[
                  styles.todoText,
                  { textDecorationLine: todo.completed ? 'line-through' : 'none' },
                ]}
              >
                {todo.text}
              </Text>
            )}

            {editingTodoId === todo.id ? (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.editButton} onPress={handleSaveEdit}>
                  <Ionicons name="ios-checkmark-circle-outline" size={24} color="#008080" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton} onPress={handleCancelEdit}>
                  <Ionicons name="ios-close-circle-outline" size={24} color="#FF0000" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditTodo(todo.id, todo.text)}
              >
                <FontAwesome name="pencil" size={24} color="#808080" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteTodo(todo.id)}
            >
              <FontAwesome name="trash" size={24} color="#F15F5F" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={handleResetTodos}>
        <Text style={styles.resetButtonText}>Reset</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={35} color="#000000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D5D5D5',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '800',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderColor: '#808080',
    marginRight:-3,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(3, 0, 102, 0.7)',
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoList: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 10,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  editButton: {
    marginHorizontal: 5,
  },
  deleteButton: {
    marginLeft: 10,
  },
  resetButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#F15F5F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default TodoScreen;