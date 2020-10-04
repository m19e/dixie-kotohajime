import React from "react";
import { ExtendedNodeData } from "react-sortable-tree";

type NodeProps = {
    value: string;
    editMode: boolean;
    setValue: (v: string) => void;
    setEditMode: (b: boolean) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    createNode: (rowInfo: ExtendedNodeData, isDir: boolean) => void;
    readNode?: () => void;
    updateNode: (rowInfo: ExtendedNodeData, obj: UpdateObj) => void;
    deleteNode: (rowInfo: ExtendedNodeData) => void;
};

export type UpdateObj = { isEditting: boolean; title?: string; isNewFile?: boolean };

const createNodeProps = (rowInfo: ExtendedNodeData, nodeProps: NodeProps): { [index: string]: JSX.Element[] } => {
    const { editMode, value, setValue, setEditMode, handleChange, createNode, updateNode, deleteNode } = nodeProps;
    if (rowInfo.node.isEditting) {
        return {
            icons: (rowInfo.node.isDir as boolean)
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
            title: [<input type="text" value={value} onChange={handleChange}></input>],
            buttons: rowInfo.node.isNewFile
                ? [
                      <button onClick={() => updateNode(rowInfo, { title: value, isEditting: false, isNewFile: false })}>Add</button>,
                      <button onClick={() => deleteNode(rowInfo)}>Cancel</button>,
                  ]
                : [
                      <button onClick={() => updateNode(rowInfo, { title: value, isEditting: false })}>Update</button>,
                      <button onClick={() => updateNode(rowInfo, { isEditting: false })}>Cancel</button>,
                  ],
        };
    }

    if (editMode)
        return {
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
        };

    return {
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
                  <button
                      onClick={() => {
                          setEditMode(true);
                          setValue(rowInfo.node.title as string);
                          updateNode(rowInfo, { isEditting: true });
                      }}
                  >
                      Rename
                  </button>,
                  <button onClick={() => createNode(rowInfo, false)}>AddFile</button>,
                  <button onClick={() => createNode(rowInfo, true)}>AddDir</button>,
                  <button onClick={() => deleteNode(rowInfo)}>Delete</button>,
              ]
            : [
                  <button
                      onClick={() => {
                          setEditMode(true);
                          setValue(rowInfo.node.title as string);
                          updateNode(rowInfo, { isEditting: true });
                      }}
                  >
                      Rename
                  </button>,
                  <button onClick={() => deleteNode(rowInfo)}>Delete</button>,
              ],
    };
};

export default createNodeProps;
