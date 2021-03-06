import axios from 'axios';
import { SubmissionError } from 'redux-form';
import cookie from 'react-cookies';

import '../interceptors/interceptor';
import { updateUser, userLogin, changeViewMode, allEployeesData } from '../actions/UserActions/user-action';
import { store } from '../store';
import  { LOGIN_URL, RESET_PASSWORD_URL, TIMESHEET_URL, LOGIN_API, TIMESHEET_EMP_API, TIMESHEET_ADMIN_API, EMPLOYEE_DETAIL_API, ALL_EMPLOYEES_DATA_API, HOURSHEET_API, RESET_PASSWORD_API, ADMIN_DETAILS_API, ADD_ENTRY_API, SEND_MAIL_API } from '../containers/constants';

export function loginAction (data, instance){
  let emp_id, empStatus, url;
 return axios.post(LOGIN_API, {
   email: data.emailId,
   password: data.password
  }).then( function (response) {
     if (response && response.data) {
       cookie.save('token', response.data.data, { path: '/', maxAge: 3600 });
       store.dispatch(userLogin());
       getUserDetail().then(function() {
         emp_id = store.getState().employee.employee.id;
         empStatus =store.getState().employee.employee.status;
         if(data.password === 'newput123'){
           url= RESET_PASSWORD_URL;
         } else {
           if(empStatus === 'admin') {
             cookie.save('viewMode', 'table', {path: '/', maxAge: 3600});
             url = `${TIMESHEET_URL}?year=${new Date().getFullYear()}&month=${new Date().getMonth()+1}`;
           }else {
             url = `${TIMESHEET_URL}?year=${new Date().getFullYear()}&month=${new Date().getMonth()+1}&emp_id=${emp_id}`;
           }
         }
         instance.history.push(url);
       }).catch(function(error){});
     }
   }).catch(function (error) {
       throw new SubmissionError({'_error': 'Invalid username or password' });
   });
}

export function getEmployeeTimesheetData(instance, data) {
  let year, month, user_id, url, empStatus;
  let viewMode = cookie.load('viewMode');
  if(data){
    year = data.year;
    month = data.month;
    if(data.employee && viewMode !== 'graph'){
      user_id = data.employee;
    }
  }
  if(store.getState().employee && store.getState().employee.employee){
    empStatus = store.getState().employee.employee.status;
    return getData(empStatus, instance, year, month, user_id);
  } else {
    getUserDetail().then(function(){
      empStatus = store.getState().employee.employee.status;
      return getData(empStatus, instance, year, month, user_id);
    }).catch(function(){});
  }
}

function getData(empStatus, instance, year, month, user_id){
  let url
  if(empStatus === 'admin'){
    if(user_id){
      url = `${TIMESHEET_ADMIN_API}?year=${year}&month=${month}&user_id=${user_id}`;
    } else {
      url = `${HOURSHEET_API}?year=${year}&month=${month}`;
    }
  } else {
    if(empStatus === 'employee'){
      url = `${TIMESHEET_EMP_API}?year=${year}&month=${month}&user_id=${user_id}`;
    }
  }
  return(
    axios.get(url).then (function (response) {
       instance.setState({hoursheetData: response.data.data, timesheetData: response.data.data.timesheetData, totalHours:response.data.data.totalHours, year, month, emp_id:user_id, isLoading:false});
    }).catch(function (error) { })
  );
}

export function getAllEmployeesDetails(instance) {
  let eachEmp={}, allEmp=[];
 return axios.get(ALL_EMPLOYEES_DATA_API).then (function (response) {
   response.data.data.map(data =>{
     eachEmp ={
       id: data.id,
       fullName: data.fullName,
       email: data.email
     }
     allEmp.push(eachEmp);
   });
  store.dispatch(allEployeesData(allEmp))
  }).catch(function (error) { })
}

export function getUserDetail() {
  return axios.get(EMPLOYEE_DETAIL_API)
    .then (function (response) {
      store.dispatch(updateUser(response.data.data));
    }).catch(function (error) {
  });
}

export function resetPassword(data, instance) {
  let emp_id, empStatus;
  return axios.put(RESET_PASSWORD_API, {
   password: data.password
  }).then( function (response) {
     emp_id = store.getState().employee.employee.id;
     empStatus = store.getState().employee.employee.status;
    if(empStatus === 'admin'){
      instance.history.push(`${TIMESHEET_URL}?year=${new Date().getFullYear()}&month=${new Date().getMonth()+1}`);
    } else {
      instance.history.push(`${TIMESHEET_URL}?year=${new Date().getFullYear()}&month=${new Date().getMonth()+1}&emp_id=${emp_id}`);
    }
  }).catch(function (error) {});
}

export function goToDashboard(history) {
  let url = `${TIMESHEET_URL}?year=${new Date().getFullYear()}&month=${new Date().getMonth()+1}`;
  cookie.save('viewMode', 'table', {path: '/', maxAge: 3600});
  history.push(url);
}

export function getAdminDetails() {
   return axios.get(ADMIN_DETAILS_API)
   .then (function (response) {
       return (response.data);
    })
  .catch(function (error) { });
}

export function addEntryToTimesheet (data) {
    return axios.post(ADD_ENTRY_API, {
    "officeIn" : data.officeIn,
    "officeOut" : data.officeOut,
    "homeIn" : data.homeIn,
    "homeOut" : data.homeOut,
    "userId" : data.employee,
    "dateString" : data.date
  })
  .then(function (response) { } )
  .catch(function(error) { } )
}

export function sendMail(data) {
  return axios.put(SEND_MAIL_API, {
    'userId' : data.employee,
    'startDate': data.startDate,
    'endDate': data.endDate,
    'subject': data.subject,
    'toEmailIds': data.toEmailIds,
    'ccEmailIds': data.ccEmailIds,
    'message': data.message,
    'month': data.month,
    'year': data.year
  })
  .then(function (response){})
  .catch(function (error) {
    throw new SubmissionError({'_error': 'Please try again.' });
  });
}
