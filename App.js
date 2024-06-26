import React, { useEffect, useState } from "react";
// import { View, Text, StatusBar, TextInput, Button, FlatList } from "react-native";
import { View, StatusBar, TextInput, FlatList, Alert } from "react-native";
import * as SQLite from "expo-sqlite";
import { NativeBaseProvider, HStack, VStack, Center, Box, Button, Text, Modal, FormControl, Input, Radio, UseTheme, Spacer, Divider, ScrollView} from 'native-base';

const db = SQLite.openDatabase("e:\\database\\habitTracker.db");

function Bottom () {
    return <NativeBaseProvider>
        <HStack width={375} maxWidth="100%" mt={3} space={3} justifyContent="space-evenly">
            <Box alignItems="center">
              <Button
                variant="solid"
                colorScheme="secondary"
                onPress={() => Alert.alert("This is the Main Menu tab")}>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  Main Menu
                </Text>
              </Button>
            </Box>
            <Box alignItems="center">
              <Button
                variant="solid"
                colorScheme="secondary"
                onPress={() => Alert.alert("This is the Statistics tab")}>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  Statistics
                </Text>
              </Button>
            </Box>
        </HStack>
      </NativeBaseProvider>;
  }

const App = () => {
    const [showModal, setShowModal] = useState(false);
    const [habitName, setHabitName] = useState("");
    const [recurrence, setRecurrence] = useState("");
    const [formOfMeasurement, setFormOfMeasurement] = useState("");
    const [goal, setGoal] = useState("");
    const [habits, setHabits] = useState([]);
  
    const createTables = () => {
      db.transaction(txn => {
        txn.executeSql(
        //   `DROP TABLE habits`,
          `CREATE TABLE IF NOT EXISTS habits (id INTEGER PRIMARY KEY AUTOINCREMENT, habitName TEXT, recurrence INTEGER, formOfMeasurement INTEGER, goal INTEGER)`,
          [],
          (sqlTxn, res) => {
            console.log("table created successfully");
          },
          error => {
            console.log("error on creating table " + error.message);
          },
        );
      });
    };
  
    const addHabit = () => {
      if (!habitName) {
        alert("Enter habit");
        return false;
      }

      const insertSql =
      "INSERT INTO habits (habitName,recurrence,formOfMeasurement,goal) VALUES ('" +
      habitName +
      "'," +
      recurrence +
      "," +
      formOfMeasurement +
      "," +
      goal +
      ")";
  
      db.transaction(txn => {
        txn.executeSql(
          insertSql,
          [],
          (sqlTxn, res) => {
            console.log(`Added successfully: ${habitName} ${recurrence} ${formOfMeasurement} ${goal}`);
            // console.log(`Added successfully: ${habitName}`);
            getHabits();
            setHabitName("");
            setRecurrence("");
            setFormOfMeasurement("");
            setGoal("");
          },
          error => {
            console.log("error on adding habit " + error.message);
          },
        );
      });

      setShowModal(false);
    };
  
    const getHabits = () => {
      db.transaction(txn => {
        txn.executeSql(
          `SELECT * FROM habits ORDER BY id DESC`,
          [],
          (sqlTxn, res) => {
            console.log("habits retrieved successfully");
            let len = res.rows.length;
  
            if (len > 0) {
              let results = [];
              for (let i = 0; i < len; i++) {
                let item = res.rows.item(i);
                results.push({ id: item.id, habitName: item.habitName, recurrence: item.recurrence, formOfMeasurement: item.formOfMeasurement, goal: item.goal });
              }
            
              setHabits(results);
            }
          },
          error => {
            console.log("error on getting habits " + error.message);
          },
        );
      });
    };
  
    const renderHabit = ({ item }) => {
      return (
        <NativeBaseProvider>
            <Center>
                <Box w="80" h="20" mb="4" ml="4" mr="4" bg="white" rounded="2xl" shadow={3} style={{flexWrap: "wrap", overflow: "hidden"}}>
                    <HStack>
                        <Box h="20" w="55"
                        backgroundColor={"cyan.600"} alignItems="center">
                            
                        </Box>
                        <VStack pt={3} pb={3} pr={5} pl={5}>
                            {/* <Text style={{ marginRight: 9 }}>{item.id}</Text>    */}
                            <Text fontSize="xl" fontWeight="bold" color="muted.900">{item.habitName}</Text>
                            <HStack alignItems={"flex-start"}>
                                <Text fontSize="sm" fontWeight="bold" color="cyan.600">{item.goal} time/s</Text>
                                <Text italic fontSize="sm" fontWeight="medium" color="coolGray.600"> every {item.recurrence} day/s</Text>
                            </HStack>
                            {/* <Text>{item.formOfMeasurement}</Text>        */}
                        </VStack>
                    </HStack>
                </Box>
            </Center>
            
            
        </NativeBaseProvider>
      );
    };
  
    useEffect(async () => {
      await createTables();
      await getHabits();
    }, []);
  
    return (
      <NativeBaseProvider>
        <Center maxWidth="100%" flex={1} justifyContent="space-between" px="3">
        
        {/* ===================================== HEADER ===================================== */}
            <HStack width={375} maxWidth="100%" space={3} justifyContent="space-between" pt={StatusBar.currentHeight + 15}>
            <VStack pl={2} alignItems="flex-start" >
                <Text fontSize="4xl" fontWeight="bold" color="black">
                    Hey there,
                </Text>
                <Text mt={-3} fontSize="4xl" fontWeight="bold" color="black">
                    Rowena
                </Text>
            </VStack>
            <Box alignItems="center">
                <Button
                variant="ghost"
                onPress={() => Alert.alert("This is the Edit Habit tab")}>
                <Text fontSize="xl" fontWeight="bold" color="cyan.600">
                    Edit
                </Text>
                </Button>
            </Box>
            <Box ml={-20} mr={-20} h="10" w="10" alignItems="center">
                <Button
                h="10" w="10"
                alignItems="center"
                variant="ghost"
                bgColor={'white'}
                shadow={3}
                rounded="full"
                onPress={() => setShowModal(true)}>
                <Text fontSize="2xl" lineHeight="25.5" fontWeight="bold" color="cyan.600">
                    +
                </Text>
                </Button>
            </Box>
            <Center>
                <Modal name="addHabitModal" isOpen={showModal} onClose={() => setShowModal(false)}>
                <Modal.Content maxWidth="400px">
                    <Modal.CloseButton />
                    <Modal.Header>Add a habit</Modal.Header>
                    <Modal.Body>
                    <Center>
                        <VStack width="100%" space={3}>
                        <FormControl isRequired>
                            <FormControl.Label>Name of habit</FormControl.Label>
                            <Input
                            width="100%"
                            placeholder="Drink water"
                            value={habitName}
                            onChangeText={setHabitName}
                             />
                        </FormControl>

                        <FormControl isRequired>
                            <FormControl.Label>Recurrence</FormControl.Label>
                            <Input
                            width="100%"
                            placeholder=""
                            value={recurrence}
                            onChangeText={setRecurrence}
                             />
                        </FormControl>

                        {/* <FormControl isRequired>
                            <FormControl.Label>Form of measurement</FormControl.Label>
                            <Input
                            width="100%"
                            placeholder=""
                            value={formOfMeasurement}
                            onChangeText={setFormOfMeasurement}
                             />
                        </FormControl> */}

                        <Text mt="3">Form of measurement</Text>
                        <Radio.Group name="formOfMeasurementGroup" accessibilityLabel="Form of measurement">
                            <HStack>
                            <Radio
                                value="1"
                                status= { formOfMeasurement === '1' ? 'checked' : 'unchecked' }
                                onPress={() => setFormOfMeasurement(1)}
                                name="formOfMeasurement"
                                mt={1}
                                mr={5}
                                // onPress={setFormOfMeasurement}
                            >
                                Increment
                            </Radio>
                            <Radio
                                value="2"
                                status= { formOfMeasurement === '2' ? 'checked' : 'unchecked' }
                                onPress={() => setFormOfMeasurement(2)}
                                name="formOfMeasurement"
                                mt={1}
                                // onPress={setFormOfMeasurement}
                            >
                                Timer
                            </Radio>
                            </HStack>
                        </Radio.Group>

                        <FormControl isRequired>
                            <FormControl.Label>Goal</FormControl.Label>
                            <Input
                            width="100%"
                            placeholder=""
                            value={goal}
                            onChangeText={setGoal}
                             />
                        </FormControl>

                        <Button variant="outline" onPress={addHabit} colorScheme="pink">
                            Submit
                        </Button>

                        </VStack>
                    </Center>
                    </Modal.Body>
                </Modal.Content>
                </Modal>
            </Center>
            </HStack>
            
        <ScrollView maxW="375" h="485">
            <Center>
                <VStack mt={5} alignItems="center">
                <FlatList
                data={habits}
                renderItem={renderHabit}
                key={cat => cat.id}
                />
                </VStack>
            </Center>
        </ScrollView>

        <Bottom />
        </Center>
      </NativeBaseProvider>
    );
  };
  
  export default App;