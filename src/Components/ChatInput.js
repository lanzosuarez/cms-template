import React from "react";
import { Input, Icon, Tooltip } from "antd";
import * as randomstring from "randomstring";

const ChatInput = ({
  queue,
  messageText,
  handleChangeMessage,
  sendMessage,
  setFiles
}) => {
  let inputRef;

  const readFile = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.readAsDataURL(file);
    });
  };

  const transformFiles = files =>
    Promise.all(
      files.map(async f => {
        f.uid = randomstring.generate(7);
        f.url = await readFile(f);
        return f;
      })
    );

  const onDrop = async e => {
    e.preventDefault();
    let dt = e.dataTransfer;
    let files = [...dt.files];
    files = await transformFiles(files);
    setFiles(files);
  };

  const onDragover = e => {
    e.stopPropagation();
    e.preventDefault();
  };

  const onSelectFiles = async e => {
    let files = [...e.target.files];
    files = await transformFiles(files);
    setFiles(files);
  };

  return (
    queue && (
      <div className="chat-input-con">
        <Tooltip title="Attach image">
          <Icon
            onClick={() => inputRef.click()}
            theme="twoTone"
            style={{ fontSize: 30, marginRight: 12, cursor: "pointer" }}
            type="picture"
          />
        </Tooltip>
        <input
          onChange={onSelectFiles}
          multiple
          ref={elRef => (inputRef = elRef)}
          style={{ display: "none" }}
          accept="image/*"
          type="file"
        />
        <Input.TextArea
          onDrop={onDrop}
          onDragOver={onDragover}
          onPressEnter={sendMessage}
          onChange={e => handleChangeMessage(e.target.value)}
          value={messageText}
          className="chat-input"
          placeholder="Say something..."
        />
      </div>
    )
  );
};
export default ChatInput;
