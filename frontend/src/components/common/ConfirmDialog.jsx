import Swal from "sweetalert2";

const ConfirmDialog = ({ 
  title = "Are you sure?", 
  text = "You won't be able to revert this!", 
  icon = "warning", 
  confirmButtonText = "Yes, delete it!", 
  onConfirm,
  buttonClassName = "btn btn-outline-danger btn-sm", // Add default class
  buttonText = "Delete" // Add default text
}) => {
  
  const showAlert = () => {
    Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText,
    }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      }
    });
  };

  return (
    <button 
      onClick={showAlert} 
      className={buttonClassName}
    >
      {buttonText}
    </button>
  );
};

export default ConfirmDialog;