import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle, faGripVertical, faMinusCircle, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

const FormComponent = ({ show, onClose }) => {
  const [key, setKey] = useState("1"); // State để quản lý tab hiện tại
  const [questions, setQuestions] = useState(
    Array.from({ length: 9 }, (_, index) => ({
      type: "Multiple Choice",
      name: `Question #${index + 1}`,
      required: true,
      description: "",
      options: ["A", "B", "C"],
      defaultOption: "Blank",
      sort: "alphabetical",
      layout: "radio_buttons",
    }))
  );

  const handleAddOption = (qIndex, index) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(index + 1, 0, "");
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex, index) => {
    if (questions[qIndex].options.length > 1) {
      const newQuestions = [...questions];
      newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleOptionChange = (qIndex, index, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[index] = value;
    setQuestions(newQuestions);
  };

  return (
    <Modal show={show} onHide={onClose} size="fullscreen">
      <Modal.Header closeButton>
        <h2 className="text-center mb-4">Adding Questions</h2>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
          {questions.map((_, index) => (
            <Tab eventKey={(index + 1).toString()} title={`Q${index + 1}`} key={index} >
              <div className="container py-4">
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select className="form-select">
                    <option>Multiple Choice</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={questions[index].name} readOnly />
                </div>

                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" id={`required-${index}`} defaultChecked />
                  <label className="form-check-label" htmlFor={`required-${index}`}>
                    Required
                  </label>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Description <FontAwesomeIcon icon={faQuestionCircle} />
                  </label>
                  <textarea className="form-control" rows="3"></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Options</label>
                  <div className="border rounded p-2">
                    {questions[index].options.map((option, optionIndex) => (
                      <div className="d-flex align-items-center mb-2" key={optionIndex}>
                        <FontAwesomeIcon icon={faGripVertical} className="me-2 text-secondary" />
                        <input
                          type="text"
                          className="form-control"
                          value={option}
                          onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                        />
                        <button
                          className="btn btn-link text-danger"
                          onClick={() => handleRemoveOption(index, optionIndex)}
                        >
                          <FontAwesomeIcon icon={faMinusCircle} />
                        </button>
                        <button
                          className="btn btn-link text-success"
                          onClick={() => handleAddOption(index, optionIndex)}
                        >
                          <FontAwesomeIcon icon={faPlusCircle} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Default Option</label>
                  <select className="form-select">
                    <option>Blank</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Sort</label>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" name={`sort-${index}`} value="alphabetical" defaultChecked />
                    <label className="form-check-label">Alphabetical</label>
                  </div>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" name={`sort-${index}`} value="custom" />
                    <label className="form-check-label">Custom</label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Layout</label>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" name={`layout-${index}`} value="dropdown_one" />
                    <label className="form-check-label">Dropdown - One Selection</label>
                  </div>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" name={`layout-${index}`} value="dropdown_multiple" />
                    <label className="form-check-label">Dropdown - Multiple Selections</label>
                  </div>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" name={`layout-${index}`} value="checkboxes" />
                    <label className="form-check-label">Check Boxes</label>
                  </div>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" name={`layout-${index}`} value="radio_buttons" defaultChecked />
                    <label className="form-check-label">Radio Buttons</label>
                  </div>
                </div>
              </div>
            </Tab>
          ))}
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default FormComponent;
