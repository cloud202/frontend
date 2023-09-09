import { AddIcon, CheckCircleIcon, ChevronDownIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons'
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Flex, FormControl, FormLabel, HStack, Input, List, ListIcon, ListItem, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, TabPanel, TabPanels, Table, TableContainer, Tabs, Tbody, Td, Text, Textarea, Th, Thead, Tr, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import axios from 'axios'

const AddModuleModal = ({solution,task,setTask,setTaskSubmitted,handleRemoveButton}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
  const [formMode, setFormMode] = useState('add');
  const toast = useToast();
  const [isAlertOpen,setIsAlertOpen] = useState(false);
  const [taskType,setTaskType] = useState("Select an option");
  const cancelRef = useRef();
  const [taskName,setTaskName] = useState("");
  const [selectedSol,setSelectedSol] = useState("Select an option");
  const [selectedSolId, setSelectedSolId] = useState("");
  const [selectedActions, setSelectedActions] = useState([]);

  const [actionName,setActionName] = useState("");
  const [script,setScript] = useState("");

  const [taskIdDelete,setTaskIdDelete] = useState(null);
  const [taskIdUpdate,setTaskIdUpdate] = useState(null);
  const [taskId,setTaskId] = useState(null);

  const submitHandler = async ()=>{
    if (
      taskName.trim() === "" || (taskType==="Select an option") ||
      (taskType === "Standard" && selectedSolId === "" ) ||
      (taskType === "Custom" && (actionName.trim() === "" || script.trim() === ""))
    ){
      toast({
        title: "Please fill all the required fields.",
        status: "error",
        duration: 3000, 
        isClosable: true,
      });
      return; 
    }

    try {
      const taskData = {
          name : taskName,
          status:true,
          task_type:taskType,
          task_actionName:actionName,
          task_script: script,
          task_admin_id:"optional",
          task_solutionid: selectedSolId
      }

      const {data} = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/master/project_task`,taskData);
      setTaskSubmitted(true);
      setTask((prevData)=>[...prevData,data]);
      toast({
        title: "Task Added",
        description: "The task has been added successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTaskName("");
      setSelectedSol("Select an option")
      setSelectedSolId("");
      setSelectedActions([])
      setTaskType("Select an option");
      setScript("")
      setActionName("")

    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Unable to add task",
        description: "Request Failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const deleteHandler = async (taskId) => {
    try {
      // Open the confirmation dialog
      setIsAlertOpen(true);
      setTaskIdDelete(taskId);
    } catch (error) {
      console.error("Error deleting phase:", error);
    }
  };

  const onConfirmDelete = async () => {

    try {
      setIsAlertOpen(false); // Close the confirmation dialog
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/master/project_task/${taskIdDelete}`);

      const updatedTask = task.filter(row => row._id !== taskIdDelete);
      setTask(updatedTask);
      // handleRemoveButton(moduleIdDelete);

      // const updatedTableData = tableData.filter(row => row.id !== phaseIdDelete);
      // setTableData(updatedTableData);
      setFormMode('add');
      toast({
        title: 'Task deleted Successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      handleRemoveButton(taskIdDelete)
      
    } catch (error) {
      console.error("Error deleting Module:", error);
      toast({
        title: 'Task not deleted.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateInitializer = async(rowData)=>{
    setTaskType(rowData.task_type);
    if(rowData.task_solutionid !== null && typeof rowData.task_solutionid === 'object'){
      const sol = rowData.task_solutionid;
      setSelectedSol(sol.name);
      handleSolutionSelect(sol.name,sol.allActions,sol._id);
    }

    if(rowData.task_type==="Custom"){
      setActionName(rowData.task_actionName);
      setScript(rowData.task_script);
    }

    setTaskIdUpdate(rowData._id);
    setTaskName(rowData.name);
    setFormMode('update');
    setTaskId(rowData.task_id);
  }

  const updateHandler = async()=>{
    if (
      taskName.trim() === "" ||
      (taskType === "Standard" && selectedSolId === "" ) ||
      (taskType === "Custom" && (actionName.trim() === "" || script.trim() === ""))
    ){
      toast({
        title: "Please fill all the required fields.",
        status: "error",
        duration: 3000, 
        isClosable: true,
      });
      return; 
    }

    try {
      const updatedData = {
        name : taskName,
        status:true,
        task_type:taskType,
        task_actionName:actionName,
        task_script:script,
        task_admin_id:"optional",
        task_solutionid: selectedSolId
      }

      const {data} = await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/master/project_task/${taskIdUpdate}`, updatedData);
      // const updatedTaskData = task.map(row => {
      //   if (row._id === taskIdUpdate) {
      //     return {
      //       ...row,
      //       name : taskName,
      //       status:true,
      //       task_type:taskType,
      //       task_actionName:"action1",
      //       task_script:"script1",
      //       task_admin_id:"optional",
      //       task_solutionid: selectedSolId
      //     };
      //   }
      //   return row;
      // });      
      // setTask(updatedTaskData);
      setTask((prevData)=>[...prevData,data]);
      setTaskSubmitted(true);
      toast({
          title: 'Task Updated Successfully.',
          description: "See the changes on task table.",
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        setFormMode('add');
        setTaskName("");
      setSelectedSol("Select an option")
      setSelectedSolId("");
      setSelectedActions([])
      setTaskType("Select an option");
      setScript("")
      setActionName("")

    } catch (error) {
      console.error("Error updating phase:", error);
      toast({
        title: 'Unable to Update task.',
        description: "Request Failed",
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const onAlertClose = () => {
    setIsAlertOpen(false);
  };

  const handleSolutionSelect = (name, allActions,id) => {
    setSelectedSol(name);
    setSelectedActions(allActions);
    setSelectedSolId(id);
  };

  
  return (
    <div>
      <Button rightIcon={<AddIcon />} size='sm' colorScheme='teal' variant='outline' onClick={onOpen}>Add Task</Button>
      <Modal isOpen={isOpen} onClose={onClose} size='6xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Define Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <Box p={4}>
            <form>
              <Flex gap={4}>
                <FormControl isRequired>
                <HStack align='start' spacing={0}>
                  <FormLabel w='100px'>Name</FormLabel>
                  <Input
                    type="text"
                    name="name"
                    value={taskName}
                    onChange={(e)=> setTaskName(e.target.value)}
                    placeholder= "Enter task name"
                    />
                    </HStack>
                </FormControl>

                <FormControl isRequired>
                <HStack align='start' spacing={0}>
                  <FormLabel>Type</FormLabel>
                  <Menu>
                    <MenuButton w="80%" as={Button} variant="outline" colorScheme="gray" rightIcon={<ChevronDownIcon />}>
                      {taskType}
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={() => setTaskType("Standard")}>Standard</MenuItem>
                        <MenuItem onClick={() => setTaskType("Custom")}>Custom</MenuItem>
                    </MenuList>
                  </Menu>
                    </HStack>
                </FormControl>

                <Box>
                  <Button size='sm'
                    rightIcon={formMode === 'add' ? <AddIcon /> : <RepeatIcon />}
                    colorScheme={formMode === 'add' ? 'blue' : 'orange'}
                    onClick={formMode === 'add' ? submitHandler : updateHandler}
                  >
                    {formMode === 'add' ? 'Add' : 'Update'}
                  </Button>
                </Box>
                </Flex>
                
                <Tabs>
                <TabPanels>
                  {taskType==="Standard" && <TabPanel p={0} mt='10px'>
                      <Flex m='0' gap={4}>
                      <FormControl isRequired>
                        <HStack align='start' spacing={0}>
                        <FormLabel w='80px'>Solution</FormLabel>
                        <Menu>
                          <MenuButton w="80%" as={Button} variant="outline" colorScheme="gray" rightIcon={<ChevronDownIcon />} >
                            {selectedSol}
                          </MenuButton>
                          <MenuList>
                              {
                                solution && solution.map((val)=> <MenuItem key={val._id} onClick={()=>handleSolutionSelect(val.name,val.allActions,val._id)}>{val.name}</MenuItem>)
                              }
                          </MenuList>
                        </Menu>
                        </HStack>
                      </FormControl>

                      <FormControl w='115%'>
                        <HStack align='start' spacing={0}>
                        <FormLabel w='80px'>Actions : </FormLabel>
                        <List>
                        {selectedActions && selectedActions.map((val,ind)=>(
                          <ListItem key={val._id}>
                            <ListIcon as={CheckCircleIcon} color='green.500' />
                            {val.action}
                          </ListItem>
                        ))}
                    </List>
                        </HStack>
                      </FormControl>
                      </Flex>                  
                  </TabPanel>}

                  {taskType==="Custom" && <TabPanel p={0} mt='10px'>
                  <Flex mb='12px'>
                  <FormControl isRequired mb='15px'>
                      <HStack align='start' spacing={0}>
                      <FormLabel>Action Name</FormLabel>
                      <Input type="text" w='70%' placeholder="Enter the action name" value={actionName} onChange={(e)=> setActionName(e.target.value)}/>
                      </HStack>
                    </FormControl>

                    <FormControl isRequired>
                      <HStack align='start' spacing={0}>
                      <FormLabel>Script</FormLabel>
                      <Textarea placeholder="Enter the script" w='70%' value={script} onChange={(e)=> setScript(e.target.value)}/>
                      </HStack>
                    </FormControl>
                    </Flex>
                  </TabPanel>
                  }
                </TabPanels>
              </Tabs>          
            </form>

            <Text mt='10px' p='5px' bg='gray.50' borderRadius='5px' fontSize={{ base: '18px', md: '22px', lg: '30px' }} color="#445069">Available Tasks</Text>
            <TableContainer mt='10px' >
            <Table colorScheme='purple' size='sm'>
              <Thead>
                <Tr>
                  <Th>Task</Th>
                  <Th>Type</Th>
                  <Th>Solution / Action</Th> 
                  <Th>API / Script</Th> 
                  <Th>Operation</Th> 
                </Tr>
              </Thead>
                  {task && task.map((rowData, index) => (
                    <Tbody key={rowData._id}>
                      {rowData.name !== "" && <Tr key={rowData._id}>
                        <Td>{rowData.name}</Td>
                        <Td>{rowData.task_type}</Td>
                        {rowData.task_type==="Standard" ? 
                        <>
                        <Td>{rowData.task_solutionid?.name}</Td>
                        <Td>{rowData.task_solutionid?.allActions?.map((sol)=> (
                                    <div key={sol._id}>
                                      <p>{sol.action}</p>
                                    </div>)) }
                                    </Td>
                                    </>:  
                                    <>
                                    <Td>{rowData.task_actionName}</Td>
                                    <Td>{rowData.task_script}</Td>
                                    </>
                                    }

                        <Td>
                            <div>
                            <Button isDisabled= {formMode==='update'} rightIcon={<RepeatIcon />} size='sm' colorScheme='orange' mr={4} onClick={()=>updateInitializer(rowData)}>
                              Update
                            </Button>

                            <Button rightIcon={<DeleteIcon />} size='sm' colorScheme='red' onClick={()=>deleteHandler(rowData._id)}>
                              Delete
                            </Button>
                              </div>
                        </Td>
                      </Tr>
                      }
                      </Tbody>
                  ))}

            </Table>
          </TableContainer> 
          </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='purple' variant='outline' mr={3} onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Phase
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this phase?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  )
}

export default AddModuleModal;
