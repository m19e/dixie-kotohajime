import React, { useState, useEffect } from "react";
import { ExpandMore, ChevronRight } from "@material-ui/icons";
import SortableTree, { TreeItem, ExtendedNodeData, removeNodeAtPath, changeNodeAtPath, addNodeUnderParent, getFlatDataFromTree } from "react-sortable-tree";
import FileExplorerTheme from "react-sortable-tree-theme-file-explorer";
import "react-sortable-tree/style.css";
import useLocalStorage from "react-use-localstorage";
import Todo from "./Todo";
import db from "./db";
import loadListFromDB from "./loadListFromDB";
import createNodeProps, { UpdateObj } from "./createNodeProps";

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
    const [editMode, setEditMode] = useState(false);
    const [content, setContent] = useState("本文を入力");

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

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
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

    const createNode = (rowInfo: ExtendedNodeData, isDir: boolean) => {
        const newNode = { isDir: isDir, isEditting: true, isNewFile: true };
        const { path } = rowInfo;
        db.table("todos")
            .add(newNode)
            .then((id) => {
                setValue("");
                setTree(
                    addNodeUnderParent({
                        treeData: tree,
                        newNode: Object.assign({}, newNode, { id: id as number }),
                        parentKey: path[path.length - 1],
                        getNodeKey: ({ treeIndex }) => treeIndex,
                        expandParent: true,
                        addAsFirstChild: true,
                    }).treeData
                );
            });

        setEditMode(true);
    };

    // TODO: extract process (DONT entrust Multiple responsibilities on single function)
    // think way of use setValue
    const updateNode = (rowInfo: ExtendedNodeData, updatedObj: UpdateObj) => {
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

        if (!updatedObj.isEditting) {
            setValue("");
            setEditMode(false);
        }

        db.table("todos")
            .update(node.id, updatedObj)
            .then(() => {
                const newTodoList = [...todoList.map((todo) => (todo.id !== node.id ? todo : Object.assign({}, todo, updatedObj)))];
                setTodoList(newTodoList);
            });
    };

    const getChildren = (node: TreeItem): number[] => {
        return getFlatDataFromTree({
            treeData: [node],
            getNodeKey: ({ treeIndex }) => treeIndex,
            ignoreCollapsed: true,
        }).map((item) => item.node.id);
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
            handleBulkDelete(getChildren(node));
        } else {
            handleDelete(node.id);
        }

        setEditMode(false);
    };

    // const createNodeProps = (rowInfo: ExtendedNodeData): { [index: string]: JSX.Element[] } => {
    //     if (rowInfo.node.isEditting)
    //         return {
    //             icons: rowInfo.node.isDir
    //                 ? [
    //                       <div
    //                           style={{
    //                               borderLeft: "solid 8px gray",
    //                               borderBottom: "solid 10px gray",
    //                               marginRight: 10,
    //                               boxSizing: "border-box",
    //                               width: 16,
    //                               height: 12,
    //                               filter: rowInfo.node.expanded
    //                                   ? "drop-shadow(1px 0 0 gray) drop-shadow(0 1px 0 gray) drop-shadow(0 -1px 0 gray) drop-shadow(-1px 0 0 gray)"
    //                                   : "none",
    //                               borderColor: rowInfo.node.expanded ? "white" : "gray",
    //                           }}
    //                       />,
    //                   ]
    //                 : [],
    //             title: [<input type="text" value={value} onChange={handleChange}></input>],
    //             buttons: rowInfo.node.isNewFile
    //                 ? [
    //                       <button onClick={() => updateNode(rowInfo, { title: value, isEditting: false, isNewFile: false })}>Add</button>,
    //                       <button onClick={() => deleteNode(rowInfo)}>Cancel</button>,
    //                   ]
    //                 : [
    //                       <button onClick={() => updateNode(rowInfo, { title: value, isEditting: false })}>Update</button>,
    //                       <button onClick={() => updateNode(rowInfo, { isEditting: false })}>Cancel</button>,
    //                   ],
    //         };

    //     if (editMode)
    //         return {
    //             icons: rowInfo.node.isDir
    //                 ? [
    //                       <div
    //                           style={{
    //                               borderLeft: "solid 8px gray",
    //                               borderBottom: "solid 10px gray",
    //                               marginRight: 10,
    //                               boxSizing: "border-box",
    //                               width: 16,
    //                               height: 12,
    //                               filter: rowInfo.node.expanded
    //                                   ? "drop-shadow(1px 0 0 gray) drop-shadow(0 1px 0 gray) drop-shadow(0 -1px 0 gray) drop-shadow(-1px 0 0 gray)"
    //                                   : "none",
    //                               borderColor: rowInfo.node.expanded ? "white" : "gray",
    //                           }}
    //                       />,
    //                   ]
    //                 : [],
    //         };

    //     return {
    //         icons: rowInfo.node.isDir
    //             ? [
    //                   <div
    //                       style={{
    //                           borderLeft: "solid 8px gray",
    //                           borderBottom: "solid 10px gray",
    //                           marginRight: 10,
    //                           boxSizing: "border-box",
    //                           width: 16,
    //                           height: 12,
    //                           filter: rowInfo.node.expanded
    //                               ? "drop-shadow(1px 0 0 gray) drop-shadow(0 1px 0 gray) drop-shadow(0 -1px 0 gray) drop-shadow(-1px 0 0 gray)"
    //                               : "none",
    //                           borderColor: rowInfo.node.expanded ? "white" : "gray",
    //                       }}
    //                   />,
    //               ]
    //             : [],
    //         buttons: rowInfo.node.isDir
    //             ? [
    //                   <button
    //                       onClick={() => {
    //                           setEditMode(true);
    //                           setValue(rowInfo.node.title as string);
    //                           updateNode(rowInfo, { isEditting: true });
    //                       }}
    //                   >
    //                       Rename
    //                   </button>,
    //                   <button onClick={() => createNode(rowInfo, false)}>AddFile</button>,
    //                   <button onClick={() => createNode(rowInfo, true)}>AddDir</button>,
    //                   <button onClick={() => deleteNode(rowInfo)}>Delete</button>,
    //               ]
    //             : [
    //                   <button
    //                       onClick={() => {
    //                           setEditMode(true);
    //                           setValue(rowInfo.node.title as string);
    //                           updateNode(rowInfo, { isEditting: true });
    //                       }}
    //                   >
    //                       Rename
    //                   </button>,
    //                   <button onClick={() => deleteNode(rowInfo)}>Delete</button>,
    //               ],
    //     };
    // };

    return (
        <div>
            <h1>TODO app</h1>
            <div style={{ height: 250 }}>
                <SortableTree
                    treeData={tree}
                    onChange={setTree}
                    theme={FileExplorerTheme}
                    canDrag={({ node }) => !editMode && !node.dragDisabled}
                    canDrop={({ nextParent }) => !nextParent || nextParent.isDir}
                    generateNodeProps={(rowInfo) =>
                        createNodeProps(rowInfo, { value, editMode, setValue, setEditMode, handleChange, createNode, updateNode, deleteNode })
                    }
                />
            </div>
            <textarea value={content} onChange={handleContentChange} cols={30} rows={10}></textarea>
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
