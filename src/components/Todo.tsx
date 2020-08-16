import React from "react";

export const Todo = (props: any) => {
    return (
        <li>
            <input type="checkbox" checked={props.done} onChange={props.onToggle} />
            {props.content}
            <button onClick={props.onDelete}>Delete</button>
        </li>
    );
};
