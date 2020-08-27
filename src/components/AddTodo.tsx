import React from "react";

const AddTodo = (props: any) => {
    return (
        <>
            <input type="text" value={props.value} onChange={props.onChange}></input>
            <button onClick={props.add}>Add</button>
            <button onClick={props.addDir}>AddDir</button>
        </>
    );
};

export default AddTodo;
