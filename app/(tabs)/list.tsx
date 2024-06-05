import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@members_list';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [value, setValue] = useState('');
  const [operation, setOperation] = useState('add');

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    saveMembers();
  }, [members]);

  const saveMembers = async () => {
    try {
      const jsonValue = JSON.stringify(members);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao salvar os dados');
    }
  };

  const loadMembers = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        setMembers(JSON.parse(jsonValue));
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao carregar os dados');
    }
  };

  const resetMembers = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setMembers([]);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao resetar os dados');
    }
  };

  const addMember = () => {
    if (title && date && value) {
      const newMember = {
        id: members.length.toString(),
        title: title,
        date: date,
        value: parseFloat(value),
        history: []
      };

      if (members.length > 0) {
        const firstMember = { ...members[0] };
        const transactionValue = parseFloat(value);
        if (operation === 'add') {
          firstMember.value += transactionValue;
          firstMember.history.push({ type: 'add', amount: transactionValue });
        } else if (operation === 'subtract') {
          firstMember.value -= transactionValue;
          firstMember.history.push({ type: 'subtract', amount: transactionValue });
        }
        setMembers([firstMember, ...members.slice(1), newMember]);
      } else {
        setMembers([newMember]);
      }
      setTitle('');
      setDate('');
      setValue('');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.date}</Text>
      <Text>{item.value.toFixed(2)}</Text>
      {item.history && item.history.length > 0 && (
        <View style={styles.historyContainer}>
          <Text>Histórico de Transações:</Text>
          {item.history.map((entry, index) => (
            <Text key={index}>
              {entry.type === 'add' ? 'Adicionado' : 'Subtraído'}: {entry.amount.toFixed(2)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Membros</Text>
      <FlatList
        data={members}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Data (DD/MM/AAAA)"
          value={date}
          onChangeText={setDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Valor Inicial"
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
        />
        <View style={styles.buttonRow}>
          <Button
            title="Adicionar ao Primeiro"
            onPress={() => setOperation('add')}
          />
          <Button
            title="Subtrair do Primeiro"
            onPress={() => setOperation('subtract')}
          />
        </View>
        <Button title="Adicionar Membro" onPress={addMember} />
        <Button title="Resetar Lista" onPress={resetMembers} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center'
  },
  inputContainer: {
    marginTop: 20
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  memberItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  historyContainer: {
    marginTop: 10
  }
});

export default MemberList;
