import React, { useState, useEffect } from "react";
import Todo from "./Todo";
import AddTodo from "./AddTodo";
import db from "./db";

interface ITodo {
    id: number;
    content: string;
    done: boolean;
}

const App = () => {
    const [value, setValue] = useState("");
    const [todoList, setTodoList] = useState<ITodo[]>([]);

    useEffect(() => {
        db.table("todos")
            .toArray()
            .then((todos) => {
                setTodoList(todos);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const add = () => {
        if (value.trim() === "") return;
        setTodoList([...todoList, { id: todoList.length, content: value, done: false }]);
        setValue("");
    };

    const handleDelete = (id: number) => {
        setTodoList(todoList.filter((todo) => todo.id !== id));
    };

    const handleToggle = (td: ITodo) => {
        const newTodoList = [...todoList.filter((todo) => todo.id !== td.id), Object.assign({}, td, { done: !td.done })];
        setTodoList(newTodoList);
    };

    return (
        <div>
            <h1>TODO app</h1>
            <AddTodo value={value} onChange={handleChange} add={add} />
            <ul>
                {todoList.map((todo: ITodo) => (
                    <Todo key={todo.id} content={todo.content} onDelete={() => handleDelete(todo.id)} onToggle={() => handleToggle(todo)} />
                ))}
            </ul>
        </div>
    );
};

export default App;
