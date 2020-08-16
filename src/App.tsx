import React, { useState } from "react";

interface ITodo {
    id: number;
    content: string;
}

const App = () => {
    const [value, setValue] = useState("");
    const [todoList, setTodoList] = useState([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const add = () => {
        console.log("add process");
    };

    const handleDelete = (id: number) => {
        console.log("delete process");
    };

    return (
        <div>
            <h1>TODO app</h1>
            <input type="text" value={value} onChange={handleChange} />
            <button onClick={add}>Add</button>
            <ul>
                {todoList.map((todo: ITodo) => (
                    <li key={todo.id}>
                        {todo.content}
                        <button onClick={() => handleDelete(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
