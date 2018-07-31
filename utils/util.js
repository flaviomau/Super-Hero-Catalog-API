exports.buildSuccessMessage = (message, data) => {
  return {
    success: true,
    message: message || "",
    data: data || ""
  }
}

exports.buildErrorMessage = (message) => { 
  return {
    success: false,
    message: message
  }
}

exports.handleNotFound = (data) => {  
  if(!data){
    const err = new Error('Not Found in database')
    err.status = 404
    throw err
  }
	return data
}