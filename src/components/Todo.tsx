import React from "react";

const Todo = (props: any) => {
    return (
        <li>
            <input type="checkbox" checked={props.todo.done} onChange={props.onToggle} />
            {props.todo.title}
            <button onClick={props.onDelete}>Delete</button>
        </li>
    );
};

export default Todo;
