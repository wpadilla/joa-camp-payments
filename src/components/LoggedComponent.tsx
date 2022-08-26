import { Button, Form, Modal } from "react-bootstrap";
import React from "react";

export interface ILoggedComponentProps {
    show?: boolean;
    onHide: () => void;
}
export const LOGGED_KEY = "JOA_CAMP_APP@loggin-data";
const SECRET_PASSWORD = 'Cautivados';

export interface IUser { user: string, password: string }
function LoggedComponent({show, onHide}: ILoggedComponentProps) {
    const [data, setData] = React.useState<IUser>({} as IUser);
    const onChange = ({target: {value, name}}: any) => setData({...data, [name]: value})

    const handleLogin = (e: any) => {
        e.preventDefault()
        if(!valid()) return;
        localStorage.setItem(LOGGED_KEY, JSON.stringify(data));
        onHide();
    }

    const valid = () => (data.password && data.password === SECRET_PASSWORD) && data.user;

    return (
        <Modal show={!!show}
               onHide={onHide}
               backdrop={'static'}
               onRequestClose={(event: any) => {
                   // Ignore react-modal esc-close handling

                   if (event.keyCode === 27) {
                       console.log('hola', event);
                       return
                   }

               }}
        >
            <Modal.Header>
                <Modal.Title>Inicia Session</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleLogin}>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>¿Cuál es tu nombre?</Form.Label>
                        <Form.Control type="text" name="user" onChange={onChange} value={data.user}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control type="password" name="password" onChange={onChange} value={data.password}/>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit" disabled={!valid()}>Iniciar</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default LoggedComponent;
