import React, { useState, useEffect } from "react";
import { ExpandMore, ChevronRight } from "@material-ui/icons";
// import { TreeView, TreeItem } from "@material-ui/lab";
import SortableTree from "react-sortable-tree";
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

const dataList: ITodo[] = [
    { id: 1, title: "Parent", parent: 0 },
    { id: 2, title: "child 1", parent: 1 },
    { id: 3, title: "child 2", parent: 2 },
    { id: 4, title: "child 3", parent: 3 },
];

const dataTree = convertLTT(dataList);

const App = () => {
    const [value, setValue] = useState("");
    const [todoList, setTodoList] = useState<ITodo[]>([]);
    const [tree, setTree] = useState<any[]>([]);
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

    const handleToggle = (td: ITodo) => {
        db.table("todos")
            .update(td.id, { done: !td.done })
            .then(() => {
                const newTodoList = [...todoList.filter((todo) => todo.id !== td.id), Object.assign({}, td, { done: !td.done })];
                setTodoList(newTodoList);
            });
    };

    // const renderTree = (nodes: ITodo) => {
    //    console.log(nodes);

    //     return (
    //         <TreeItem key={nodes.id} nodeId={"" + nodes.id} label={nodes.title}>
    //             {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    //         </TreeItem>
    //     );
    // };

    return (
        <div>
            <h1>TODO app</h1>
            <AddTodo value={value} onChange={handleChange} add={add} addDir={addDir} />
            {/* <TreeView
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
            </TreeView> */}
            {/* <TreeView
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
                defaultExpanded={[...todoList.map((td) => "" + td.id)]}
                style={{ maxWidth: "200px", overflow: "hidden" }}
            >
                {renderTree(tree)}
            </TreeView> */}
            <div style={{ height: 400 }}>
                <SortableTree
                    treeData={tree}
                    onChange={setTree}
                    theme={FileExplorerTheme}
                    canDrag={({ node }) => !node.dragDisabled}
                    canDrop={({ nextParent }) => !nextParent || nextParent.isDir}
                    generateNodeProps={(rowInfo) => ({
                        icons: rowInfo.node.isDir
                            ? [
                                  <div
                                      style={{
                                          borderLeft: "solid 8px gray",
                                          borderBottom: "solid 10px gray",
                                          marginRight: 10,
                                          boxSizing: "border-box",
                                          width: 16,
                                          height: 12,
                                          filter: rowInfo.node.expanded
                                              ? "drop-shadow(1px 0 0 gray) drop-shadow(0 1px 0 gray) drop-shadow(0 -1px 0 gray) drop-shadow(-1px 0 0 gray)"
                                              : "none",
                                          borderColor: rowInfo.node.expanded ? "white" : "gray",
                                      }}
                                  />,
                              ]
                            : [],
                        buttons: rowInfo.node.isDir
                            ? [
                                  <button onClick={() => console.log(rowInfo.node)}>Rename</button>,
                                  <button onClick={() => console.log(rowInfo.node)}>AddFile</button>,
                                  <button onClick={() => console.log(rowInfo.node)}>Delete</button>,
                              ]
                            : [
                                  <button onClick={() => console.log(rowInfo.node)}>Rename</button>,
                                  <button onClick={() => console.log(rowInfo.node)}>Delete</button>,
                              ],
                    })}
                />
            </div>
            <ul>
                {todoList.map((todo: ITodo) => (
                    <Todo key={todo.id} todo={todo} onDelete={() => handleDelete(todo.id)} onToggle={() => handleToggle(todo)} />
                ))}
            </ul>
        </div>
    );
};

export default App;
