import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { IPerson } from "../App";
import { toast } from "react-toastify";
import { IUser, LOGGED_KEY } from "./LoggedComponent";

export interface IHandlePersonProps {
    show?: boolean;
    onHide: () => void;
    handle: (person: IPerson, isHistory?: boolean) => void;
    person?: IPerson;
}

function HandlePerson({show, onHide, handle, person}: IHandlePersonProps) {
    const [data, setData] = React.useState<{ name: string, quantity: string, comment?: string, type: string }>({name: person?.name} as any);

    React.useEffect(() => {
        setData( {...data, name: person?.name as any });
    }, [person])

    const onChange = ({target: {value, name}}: any) => setData({...data, [name]: value})
    const handleAdd = (e: any) => {
        e.preventDefault();
        if (!valid()) {
            return toast('¡Llena los campos correctamente!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                type: "error",
            });
        }
        const user: IUser = JSON.parse(localStorage.getItem(LOGGED_KEY) || '{}') as IUser

        const payload: IPerson = {
            name: data.name,
            payments: {
                total: person ? person.payments.total + Number(data.quantity) : Number(data.quantity),
                history: [
                    ...(person ? person.payments.history : []),
                    {
                        quantity: Number(data.quantity),
                        date: (new Date()).toString(),
                        user: user.user,
                        comment: data.comment || '',
                        type: data.type
                    }
                ],
            }
        }
        handle(payload);
    }

    const valid = () => data.name && data.quantity && !!data.type;
    const deleteHistory = (index: any) => () => {
        if(person) {
            let deletedHistory: any = {};
            const history = person.payments.history.filter((item, i) => {
                if(i !== index){
                    return true;
                } else {
                    deletedHistory = item;
                }
            });

            const payload: IPerson = {
                ...person,
                payments: {
                    total: person.payments.total - Number(deletedHistory.quantity),
                    history,
                }
            }

            setData({...data, comment: ''});
            handle(payload, true);
        }
    };

    return (
        <Modal show={!!show} onHide={onHide}>
            <Modal.Header closeButton closeLabel="">
                <Modal.Title>{person ? 'Editar' : 'Agregar'} Persona</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAdd}>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" name="name" onChange={onChange} value={data.name}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Abono</Form.Label>
                        <Form.Control type="number" name="quantity" onChange={onChange} value={data.quantity}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Comentario</Form.Label>
                        <Form.Control type="text" name="comment" onChange={onChange} value={data.comment}/>
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex align-items-center justify-content-around" controlId="formBasicPassword">
                        <Form.Check
                            type="radio"
                            label="Efectivo"
                            value="Efectivo"
                            id="efective"
                            name="type"
                            onChange={onChange}
                        />
                        <Form.Check
                            type="radio"
                            label="Transferencia"
                            value="Transferencia"
                            id="transfer"
                            name="type"
                            onChange={onChange}
                        />
                    </Form.Group>
                    {person &&
                      <div className="mt-4">
                        <h3 className="text-center">Historial</h3>
                          {person.payments.history.map((history, index) =>
                              <div key={index}
                                   className={`d-flex justify-content-between p-md-3 ${person.payments.history.length -1 !== index ? 'border-bottom' : ''}`}>
                                  <span className="w-100">
                                      RD${history.quantity} <br/>
                                      <i>{history.type || 'Efectivo'}</i>
                                  </span>
                                  <span className="w-100"><b>Registrado por</b> <br/> {history.user}
                                  <br/>
                                      <span>{history.comment}</span>
                                  </span>
                                  <span className="w-100 text-end">
                                      {new Date(history.date).toLocaleDateString()}
                                      &nbsp;
                                      {
                                          person.payments.history.length > 1 &&
                                        <i className="bi bi-x-circle cursor-pointer ms-3 text-danger" onClick={deleteHistory(index)}/>
                                      }
                                  </span>
                              </div>
                          )}
                      </div>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={!valid()}>Guardar</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default HandlePerson
