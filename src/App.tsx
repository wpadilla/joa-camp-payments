import React from 'react';
import './App.scss';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import HandlePerson from "./components/HandlePerson";
import { Button, Form, FormControl, Modal } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import LoggedComponent from "./components/LoggedComponent";

export interface IPayment {
  total: number;
  history:{
    quantity: number;
    date: Date;
    user: string;
    comment?: string;
  }[]

}

export interface IPerson {
  name: string;
  payments: IPayment;
}

export const PAYMENT_COMPLETED = 3500;

const PERSON_LIST_KEY = 'JOA_CAMP_APP@person-list';

function App() {
  const [persons, setPersons] = React.useState<IPerson[]>([]);
  const [selectedPerson, setSelectedPerson] = React.useState<IPerson>();
  const [filteredPersons, setFilteredPersons] = React.useState<IPerson[]>([]);
  const [handlePersonModal, setHandlePersonModal] = React.useState(false);
  const [loggedModal, setLoggedModal] = React.useState(true);

  const handleModalShow = (fn: any, value?: boolean) => () => {
    fn(!!value);
    !value && setSelectedPerson(undefined);
  };

  const addPayment = () => {}
  const add = () => {}
  const remove = () => {}
  const loadPersons = () => {
    let localList = JSON.parse(localStorage.getItem(PERSON_LIST_KEY) || "[]");
    console.log(localList, 'klk');
    setPersons(localList);
    setFilteredPersons(localList);
    selectedPerson && setSelectedPerson(localList.find((item:IPerson) => item.name === selectedPerson.name) || selectedPerson)
  }

  React.useEffect(() => {
    loadPersons();
  }, [])


  const filterPersons = ({ target: { value }}: any) => setFilteredPersons(persons.filter(person => {
    if(!value || !person.name) return true;
    const name = value.replace(/[ ]/gi, "").toLowerCase();
    const personName = person.name.replace(/[ ]/gi, "").toLowerCase();
    return personName.includes(name);
  }));

  const onSubmitPerson = async (person: IPerson, isHistory?: boolean) => {
    if(!selectedPerson && persons.find((item) => {
      if(!item.name || !person) {
        return false;
      }
      return person.name.replace(/[ ]/gi, "").toLowerCase() === item.name.replace(/[ ]/gi, "").toLowerCase();
    })) {
      toast('!Esta Persona ya existe!', {
        position: "top-right",
        type: "error",
      });
      return;
    } else if(person.payments.total > PAYMENT_COMPLETED) {
      return toast('!El Abono soprebasa los ' + PAYMENT_COMPLETED + ' pesos!', { type: 'error'} )
    }

    let newPersonsList;
    if(selectedPerson) {
      newPersonsList = persons.map(item => {
        if(item.name === selectedPerson.name) {
          return {
            ...item,
            ...person,
          }
        }
        return item;
      })
    } else {
      newPersonsList =  [...persons, person];
    }

    await localStorage.setItem(PERSON_LIST_KEY, JSON.stringify(newPersonsList));
    loadPersons();
    if(!isHistory && selectedPerson) handleModalShow(setHandlePersonModal)();
    toast('!Operacion Exitosa!', {
      position: "top-right",
      type: "success",
    });
  }

  const selectPerson = (person: IPerson) => () => {
    setSelectedPerson(person);
    setHandlePersonModal(true);
  }

  const closeLoggedModal = () => setLoggedModal(false);
  const totalPaid = persons.reduce((acc, curr) => curr.payments.total === PAYMENT_COMPLETED ? acc + 1 : acc, 0);

  return (
    <div className="App">
      <Button className="add-button" onClick={handleModalShow(setHandlePersonModal, true)} variant="outline-primary">
        <i className="bi bi-plus-lg"/>
      </Button>

      <h1>Listado Cautivados</h1>
      <div className="persons-list-wrapper">
        <div className="mx-5 my-3">
          <FormControl onChange={filterPersons} placeholder="Buscar" type="text"/>
          <div>
            <span><b>{totalPaid}</b> pagados de <b>{persons.length}</b></span>
          </div>
        </div>
        <ul className="persons-list mx-5">
          {filteredPersons.map((person, i) =>
              <li className="persons-list-item" key={i} onClick={selectPerson(person)}>
                <span className="w-100 text-start">{person.name}</span>
                <span className="w-100">{person.payments.total === PAYMENT_COMPLETED ? '¡PAGO! ❤️‍🔥' : person.payments.total}</span>
                <span className="w-100 text-end">{new Date(person.payments.history[person.payments.history.length - 1].date).toLocaleDateString()}</span>
              </li>)
          }
        </ul>
      </div>
      <HandlePerson person={selectedPerson} show={handlePersonModal} onHide={handleModalShow(setHandlePersonModal)} handle={onSubmitPerson} />
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
      />
      {/* Same as */}
      <ToastContainer />
      <LoggedComponent show={loggedModal} onHide={closeLoggedModal} />
    </div>
  );
}

export default App;
