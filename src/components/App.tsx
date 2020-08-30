import React, { useState, useEffect } from "react";
import { ExpandMore, ChevronRight } from "@material-ui/icons";
// import { TreeView, TreeItem } from "@material-ui/lab";
import SortableTree, { TreeItem, ExtendedNodeData, removeNodeAtPath, changeNodeAtPath, addNodeUnderParent } from "react-sortable-tree";
import FileExplorerTheme from "react-sortable-tree-theme-file-explorer";
import "react-sortable-tree/style.css";
import useLocalStorage from "react-use-localstorage";
import Todo from "./Todo";
import AddTodo from "./AddTodo";
import db from "./db";
import convertLTT from "./convertLTT";
import loadListFromDB from "./loadListFromDB";

interface ITodo {
    id: number;
    title: string;
    done?: boolean;
    parent: number;
    children?: ITodo[];
}

const App = () => {
    const [value, setValue] = useState("");
    const [todoList, setTodoList] = useState<ITodo[]>([]);
    const [tree, setTree] = useState<TreeItem[]>([]);
    const [treeLocal, setTreeLocal] = useLocalStorage("mytodolist-tree", JSON.stringify([{ id: 1, title: "Menu", parent: 0, isDir: true }]));

    useEffect(() => {
        loadListFromDB("todos", setTodoList);
        setTree(JSON.parse(treeLocal));
    }, []);

    useEffect(() => {
        setTreeLocal(JSON.stringify(tree));
    }, [tree]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const add = () => {
        if (value.trim() === "") return;
        const todo = { title: value, done: false, parent: 0 };
        db.table("todos")
            .add(todo)
            .then((id) => {
                setTodoList([...todoList, { id: id as number, title: value, done: false, parent: 0 }]);
                setTree([...tree, Object.assign({}, todo, { id: id as number })]);
                setValue("");
            });
    };

    const addDir = () => {
        if (value.trim() === "") return;
        const todo = { title: value, done: false, parent: 0, isDir: true };
        db.table("todos")
            .add(todo)
            .then((id) => {
                setTodoList([...todoList, { id: id as number, title: value, done: false, parent: 0 }]);
                setTree([...tree, Object.assign({}, todo, { id: id as number })]);
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

    const handleBulkDelete = (ids: number[]) => {
        db.table("todos")
            .bulkDelete(ids)
            .then(() => {
                setTodoList(todoList.filter((todo) => !ids.includes(todo.id)));
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

    const createNode = (rowInfo: ExtendedNodeData, addNode: { [key: string]: string }) => {
        // maybe use 'addNodeUnderParent'
    };

    const updateNode = (rowInfo: ExtendedNodeData, updatedObj: { [key: string]: string | boolean }) => {
        const { path, node } = rowInfo;
        const newNode = Object.assign({}, node, updatedObj);
        setTree(
            changeNodeAtPath({
                treeData: tree,
                path,
                newNode,
                getNodeKey: ({ treeIndex }) => treeIndex,
                ignoreCollapsed: false,
            })
        );

        setValue("");

        db.table("todos")
            .update(node.id, updatedObj)
            .then(() => {
                const newTodoList = [...todoList.map((todo) => (todo.id !== node.id ? todo : Object.assign({}, todo, updatedObj)))];
                setTodoList(newTodoList);
            });
    };

    const deleteNode = (rowInfo: ExtendedNodeData) => {
        const { path, node } = rowInfo;
        setTree(
            removeNodeAtPath({
                treeData: tree,
                path,
                getNodeKey: ({ treeIndex }) => treeIndex,
                ignoreCollapsed: false,
            })
        );

        if (Array.isArray(node.children) && node.children.length !== 0) {
            handleBulkDelete([...node.children.map((child) => child.id), node.id]);
        } else {
            handleDelete(node.id);
        }
    };

    return (
        <div>
            <h1>TODO app</h1>
            <AddTodo value={value} onChange={handleChange} add={add} addDir={addDir} />
            <div style={{ height: 400 }}>
                <SortableTree
                    treeData={tree}
                    onChange={setTree}
                    theme={FileExplorerTheme}
                    canDrag={({ node }) => !node.dragDisabled}
                    canDrop={({ nextParent }) => !nextParent || nextParent.isDir}
                    generateNodeProps={(rowInfo) => createNodeProps(rowInfo)}
                />
            </div>
            <h2>Data on DB</h2>
            <ul>
                {todoList.map((todo: ITodo) => (
                    <Todo key={todo.id} todo={todo} onDelete={() => handleDelete(todo.id)} onToggle={() => handleToggle(todo)} />
                ))}
            </ul>
        </div>
    );
};

export default App;
