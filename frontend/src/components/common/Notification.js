import Swal from 'sweetalert2'

export const showAlert = (options) => {
  return Swal.fire(options)
}
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
})

export const showSuccess = (message) => {
  return Swal.fire({
    icon: 'success',
    title: message
  })
}

export const showError = (message) => {
  return Swal.fire({
    icon: 'error',
    title: message
  })
}