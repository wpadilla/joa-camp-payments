import React from 'react';
import './App.scss';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import HandlePerson from "./components/HandlePerson";
import { Button, FormControl, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import LoggedComponent from "./components/LoggedComponent";
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore/lite';
import { initializeApp } from "firebase/app";
import { pseudoRandomBytes } from "crypto";

const firebaseConfig = {
    apiKey: "AIzaSyDwFNI4Er6oAvFC3-hNxVr6c854gB_Zb6U",
    authDomain: "oasis-59da5.firebaseapp.com",
    projectId: "oasis-59da5",
    storageBucket: "oasis-59da5.appspot.com",
    messagingSenderId: "419441859206",
    appId: "1:419441859206:web:994544b4e053492f49cf07",
    measurementId: "G-EFQE4Y41GC"
};

// Initialize Firebase
initializeApp(firebaseConfig);



export interface IPayment {
    total: number;
    history: {
        quantity: number;
        date: Date;
        user: string;
        type: string;
        comment?: string;
    }[]

}

export interface IPerson {
    name: string;
    payments: IPayment;
}

export const COMPLETED_PAYMENT = 3500;
export const RAW_PAYMENT = 3160;

const PERSON_LIST_KEY = 'JOA_CAMP_APP@person-list';

export const getPersonListStore = () => {
    const db = getFirestore();
    return doc(db, 'person-list', PERSON_LIST_KEY);
}

function App() {
    const [persons, setPersons] = React.useState<IPerson[]>([]);
    const [selectedPerson, setSelectedPerson] = React.useState<IPerson>();
    const [filteredPersons, setFilteredPersons] = React.useState<IPerson[]>([]);
    const [handlePersonModal, setHandlePersonModal] = React.useState(false);
    const [loggedModal, setLoggedModal] = React.useState(true);
    const [loading, setLoading] = React.useState(false);

    const handleModalShow = (fn: any, value?: boolean) => () => {
        fn(!!value);
        !value && setSelectedPerson(undefined);
    };

    const addPayment = () => {
    }
    const add = () => {
    }
    const remove = () => {
    }
    const loadPersons = () => {
        setLoading(true);
        const getData = async () => {
            const store = getPersonListStore();
            const {data} = (await getDoc(store)).data() || { data: [] };
            setPersons(data);
            setFilteredPersons(data);
            setLoading(false);
            selectedPerson && setSelectedPerson(data.find((item: IPerson) => item.name === selectedPerson.name) || selectedPerson)
        }
        getData();
        // let localList = JSON.parse(localStorage.getItem(PERSON_LIST_KEY) || "[]");
    }

    React.useEffect(() => {
        loadPersons();
    }, [])

    const filterPersons = ({target: {value}}: any) => setFilteredPersons(persons.filter(person => {
        if (!value || !person.name) return true;
        const name = value.replace(/[ ]/gi, "").toLowerCase();
        const personName = person.name.replace(/[ ]/gi, "").toLowerCase();
        return personName.includes(name);
    }));

    const onSubmitPerson = async (person: IPerson, isHistory?: boolean) => {
        if (!selectedPerson && persons.find((item) => {
            if (!item.name || !person) {
                return false;
            }
            return person.name.replace(/[ ]/gi, "").toLowerCase() === item.name.replace(/[ ]/gi, "").toLowerCase();
        })) {
            toast('!Esta Persona ya existe!', {
                position: "top-right",
                type: "error",
            });
            return;
        } else if (person.payments.total > COMPLETED_PAYMENT) {
            return toast('!El Abono soprebasa los ' + COMPLETED_PAYMENT + ' pesos!', {type: 'error'})
        }

        let newPersonsList;
        if (selectedPerson) {
            newPersonsList = persons.map(item => {
                if (item.name === selectedPerson.name) {
                    return {
                        ...item,
                        ...person,
                    }
                }
                return item;
            })
        } else {
            newPersonsList = [...persons, person];
        }

        // await localStorage.setItem(PERSON_LIST_KEY, JSON.stringify(newPersonsList));
        const entity = getPersonListStore();
        setLoading(true)
        setDoc(entity, {data: newPersonsList}).then((res: any) => {
            setLoading(false)
            toast('!Operacion Exitosa!', {
                position: "top-right",
                type: "success",
            });
            if (!isHistory && selectedPerson) handleModalShow(setHandlePersonModal)();
            loadPersons();
        }).catch((e: any) => {
            setLoading(false);
            console.error(e.message)
        });



    }

    const selectPerson = (person: IPerson) => () => {
        setSelectedPerson(person);
        setHandlePersonModal(true);
    }

    const closeLoggedModal = () => setLoggedModal(false);
    let totalMoney = 0;
    let restMoney = 0;
    let budget = 0;

    const totalPersonPaid = persons.reduce((acc, curr) => {
        totalMoney += curr.payments.total;
        restMoney += COMPLETED_PAYMENT - curr.payments.total;
        if (curr.payments.total > RAW_PAYMENT) {
            budget += curr.payments.total - RAW_PAYMENT;
        }

        return curr.payments.total === COMPLETED_PAYMENT ? acc + 1 : acc;
    }, 0);

    return (
        <div className="App">
            {
                loading && <div className="loading-wrapper">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            }
            <Button className="add-button" onClick={handleModalShow(setHandlePersonModal, true)}
                    variant="outline-primary">
                <i className="bi bi-plus-lg"/>
            </Button>

            <h1>Listado Cautivados</h1>
            <div className="persons-list-wrapper">
                <div className="mx-5 my-3">
                    <FormControl onChange={filterPersons} placeholder="Buscar" type="text"/>
                    <div className="accounting-grid">
                        <div className="grid-item">
                            <b>{totalPersonPaid}</b> pagados de <b>{persons.length}</b>
                        </div>
                        <div className="grid-item">
                            <b>Pagado:</b> RD${totalMoney.toLocaleString()}
                        </div>
                        <div className="grid-item">
                            <b>Restante:</b> RD${restMoney.toLocaleString()}
                        </div>
                        <div className="grid-item">
                            <b>Presupuesto:</b> RD${budget.toLocaleString()}
                        </div>
                    </div>
                </div>
                <ul className="persons-list mx-5">
                    {filteredPersons.map((person, i) =>
                        <li className="persons-list-item" key={i} onClick={selectPerson(person)}>
                            <span className="w-100 text-start">{person.name}</span>
                            <span
                                className="w-100">{person.payments.total === COMPLETED_PAYMENT ? '¡PAGO! ❤️‍🔥' : person.payments.total}</span>
                            <span
                                className="w-100 text-end">{new Date(person.payments.history[person.payments.history.length - 1].date).toLocaleDateString()}</span>
                        </li>)
                    }
                </ul>
            </div>
            <HandlePerson person={selectedPerson} show={handlePersonModal}
                          onHide={handleModalShow(setHandlePersonModal)} handle={onSubmitPerson}/>
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
            <ToastContainer/>
            <LoggedComponent show={loggedModal} onHide={closeLoggedModal}/>
        </div>
    );
}

export default App;
