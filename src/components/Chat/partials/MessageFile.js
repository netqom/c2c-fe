import React from "react"

function MessageFile(props) {
    const { file } = props;
    return (
        <div className="attachetment-files mb-3" onClick={() => window.open(file.file_path, "_blank", 'noopener,noreferrer')}>
            <div>
                <img className="rounded-1" src={file.file_path} alt="file" height="50px;" width="50px;" />
            </div>
        </div>
    );
}

export default MessageFile;