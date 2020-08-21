import React, { useState, useEffect } from "react";
import { ExpandMore, ChevronRight } from "@material-ui/icons";
import { TreeView, TreeItem } from "@material-ui/lab";
import TreeModel from "tree-model";
import Todo from "./Todo";
import AddTodo from "./AddTodo";
import db from "./db";
import convertLTT from "./convertLTT";
import loadListFromDB from "./loadListFromDB";

interface ITodo {
    id: number;
    content: string;
    done?: boolean;
    parent?: number;
    children?: ITodo[];
}

const dataTree: ITodo = {
    id: 0,
    content: "Parent",
    children: [
        {
            id: 1,
            content: "Child - 1",
        },
        {
            id: 3,
            content: "Child - 3",
            children: [
                {
                    id: 4,
                    content: "Child - 4",
                },
            ],
        },
    ],
};

const App = () => {
    const [value, setValue] = useState("");
    const [todoList, setTodoList] = useState<ITodo[]>([]);
    const [tree, setTree] = useState<ITodo | null>(null);

    useEffect(() => {
        db.table("todos")
            .toArray()
            .then((todos) => {
                setTodoList(todos);
            });
    }, []);

    useEffect(() => {
        setTree(convertListToTree(todoList) || dataTree);
    }, [todoList]);

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

    const convertListToTree = (todos: ITodo[]) => {
        return null;
    };

    const renderTree = (nodes: ITodo) => (
        <TreeItem key={nodes.id} nodeId={"" + nodes.id} label={nodes.content}>
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </TreeItem>
    );

    return (
        <div>
            <h1>TODO app</h1>
            <AddTodo value={value} onChange={handleChange} add={add} />
            <TreeView
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
                defaultExpanded={["0"]}
                style={{ maxWidth: "200px", overflow: "hidden" }}
            >
                <TreeItem nodeId="0" label="TodoList">
                    {todoList.map((todo: ITodo) => (
                        <TreeItem key={todo.id} nodeId={"" + todo.id} label={todo.content} />
                    ))}
                </TreeItem>
            </TreeView>
            <TreeView
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
                defaultExpanded={["0"]}
                style={{ maxWidth: "200px", overflow: "hidden" }}
            >
                {renderTree(dataTree)}
            </TreeView>
            <ul>
                {todoList.map((todo: ITodo) => (
                    <Todo key={todo.id} todo={todo} onDelete={() => handleDelete(todo.id)} onToggle={() => handleToggle(todo)} />
                ))}
            </ul>
        </div>
    );
};

export default App;
