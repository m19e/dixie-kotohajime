import LTT from "list-to-tree";

const convertLTT = (list) => new LTT(list, { key_id: "id", key_parent: "parent", key_child: "children" }).GetTree();

export default convertLTT;
