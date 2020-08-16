import React from "react";

export const AddTodo = (props: any) => {
    return (
        <>
            <input type="text" value={props.value} onChange={props.onChange}></input>
            <button onClick={props.add}>Add</button>
        </>
    );
};