import React, { useState, useEffect } from "react";
import { ExpandMore, ChevronRight } from "@material-ui/icons";
import { TreeView, TreeItem } from "@material-ui/lab";
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
        const todo = { content: value, done: false };
        db.table("todos")
            .add(todo)
            .then((id) => {
                setTodoList([...todoList, { id: id as number, content: value, done: false }]);
                setValue("");
            });
    };

    const handleDelete = (id: number) => {
        db.table("todos")
            .delete(id)
            .then(() => {
                setTodoList(todoList.filter((todo) => todo.id !== id));
            });
    };

    const handleToggle = (td: ITodo) => {
        db.table("todos")
            .update(td.id, { done: !td.done })
            .then(() => {
                const newTodoList = [...todoList.filter((todo) => todo.id !== td.id), Object.assign({}, td, { done: !td.done })];
                setTodoList(newTodoList);
            });
    };

    return (
        <div>
            <h1>TODO app</h1>
            <AddTodo value={value} onChange={handleChange} add={add} />
            <ul>
                {todoList.map((todo: ITodo) => (
                    <Todo todo={todo} onDelete={() => handleDelete(todo.id)} onToggle={() => handleToggle(todo)} />
                ))}
            </ul>
        </div>
    );
};

export default App;
