import React from "react";
import { Chip } from "primereact/chip";

const ChipStatusComponent = ({ id, nameStatus }) => {
    return (
        <Chip
            label={nameStatus}
            className="mr-2 mb-2"
            style={{
                background: id === 1 ? "#00a19b" : id === 2 ? "#f59e0b" : id === 3 ? "#ef4444" : "",
                color: "white",
            }}
        />
    );
};

export default ChipStatusComponent;
