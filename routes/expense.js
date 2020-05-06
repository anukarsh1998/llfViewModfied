const express = require('express');
//const router = express.Router();
const pool = require('../db/dbConfig');
const verify = require('../config/verifyToken');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Router = require('express-promise-router');
const format = require('pg-format');
const router = new Router()

router.get('/testQuery',(resquest, response) => {

  pool.query('SELECT exp.sfid,  exp.Project_Name__c, pro.name as proname,exp.Name as expName FROM salesforce.Milestone1_Expense__c as exp JOIN salesforce.Milestone1_Project__c as pro ON exp.Project_name__c = pro.sfid')
  .then((testQueryResult) => {
      response.send(testQueryResult.rows);
  })
  .catch((testQueryError) => {
    response.send(testQueryError.stack);
  })

});

router.get('/',verify, async (request, response) => {

    console.log('Expense request.user '+JSON.stringify(request.user));
    var userId = request.user.sfid; 
    var objUser = request.user;
    console.log('Expense userId : '+userId);

    /* var objProjectList = [];

    await
    pool
  .query('SELECT sfid, Name FROM salesforce.Contact  WHERE sfid = $1;',[userId])
  .then(contactResult => {
    console.log('Name of Contact  ::     '+contactResult.rows[0].name+' sfid'+contactResult.rows[0].sfid);
    var contactId = contactResult.rows[0].sfid;
      pool
      .query('SELECT sfid, Name, Team__c FROM salesforce.Team_Member__c WHERE Representative__c = $1 ;',[userId])
      .then(teamMemberResult => {
        console.log('Name of TeamMemberId  : '+teamMemberResult.rows[0].name+'   sfid :'+teamMemberResult.rows[0].sfid);
        console.log('Team Id  : '+teamMemberResult.rows[0].team__c);
        console.log('Number of Team Member '+teamMemberResult.rows.length);
        
        var projectTeamparams = [], lstTeamId = [];
        for(var i = 1; i <= teamMemberResult.rows.length; i++) {
          projectTeamparams.push('$' + i);
          lstTeamId.push(teamMemberResult.rows[i-1].team__c);
        } 
        var projectTeamQueryText = 'SELECT sfid, Name, Project__c FROM salesforce.Project_Team__c WHERE Team__c IN (' + projectTeamparams.join(',') + ')';
        console.log('projectTeamQueryText '+projectTeamQueryText);
        
          pool
          .query(projectTeamQueryText,lstTeamId)
          .then((projectTeamResult) => {
              console.log('projectTeam Reocrds Length '+projectTeamResult.rows.length);
              console.log('projectTeam Name '+projectTeamResult.rows[0].name);

              var projectParams = [], lstProjectId = [];
              for(var i = 1; i <= projectTeamResult.rows.length; i++) {
                projectParams.push('$' + i);
                lstProjectId.push(projectTeamResult.rows[i-1].project__c);
              } 
              console.log('lstProjectId  : '+lstProjectId);
              var projetQueryText = 'SELECT sfid, Name FROM salesforce.Milestone1_Project__c WHERE sfid IN ('+ projectParams.join(',')+ ')';

              pool.
              query(projetQueryText, lstProjectId)
              .then((projectQueryResult) => { 
                    console.log('Number of Projects '+projectQueryResult.rows.length);
                    console.log('Project sfid '+projectQueryResult.rows[0].sfid+ 'Project Name '+projectQueryResult.rows[0].name);
                    var projectList = projectQueryResult.rows;
                    objProjectList = projectQueryResult.rows;
                    var lstProjectId = [], projectParams = [];
                    var j = 1;
                    projectList.forEach((eachProject) => {
                      console.log('eachProject sfid : '+eachProject.sfid);
                      lstProjectId.push(eachProject.sfid);
                      projectParams.push('$'+ j);
                      console.log('eachProject name : '+eachProject.name);
                      j++;
                    });


                  var taskQueryText = 'SELECT sfid, Name FROM salesforce.Milestone1_Task__c  WHERE Project_Name__c IN ('+projectParams.join(',')+') AND  Project_Milestone__c IN (SELECT sfid FROM salesforce.Milestone1_Milestone__c WHERE Name = \'Timesheet Category\') AND sfid IS NOT NULL';
                  console.log('taskQueryText  : '+taskQueryText);



                    pool
                    .query(taskQueryText, lstProjectId)
                    .then((taskQueryResult) => {
                        console.log('taskQueryResult  rows '+taskQueryResult.rows.length);
                       // response.send({projectList : projectQueryResult.rows, contactList : contactResult.rows, taskList : taskQueryResult.rows }); // render calendar
                    })
                    .catch((taskQueryError) => {
                        console.log('taskQueryError : '+taskQueryError.stack);
                       // response.send({projectList : projectQueryResult.rows, contactList : contactResult.rows, taskList : taskQueryResult.rows }); // render calendar
                    })
                    
              })
              .catch((projectQueryError) => {
                    console.log('projectQueryError '+projectQueryError.stack);
              })
           
          })
            .catch((projectTeamQueryError) =>{
              console.log('projectTeamQueryError : '+projectTeamQueryError.stack);
            })          
        })
        .catch((teamMemberQueryError) => {
        console.log('Error in team member query '+teamMemberQueryError.stack);
        })

      }) 
      .catch(contactQueryError => console.error('Error executing contact query', contactQueryError.stack));


    await
    pool
    .query('SELECT id, sfid, Name , Project_Name__c, Approval_Status__c, Amount_Claimed__c, petty_cash_amount__c, Conveyance_Amount__c, Tour_bill_claim_Amount__c FROM salesforce.Milestone1_Expense__c WHERE Incurred_By_Heroku_User__c = $1 AND sfid != \'\'',[userId])
    .then((expenseQueryResult) => {
        console.log('expenseQueryResult   : '+JSON.stringify(expenseQueryResult.rows));
            if(expenseQueryResult.rowCount > 0)
            {
                console.log('expenseQueryResult   : '+JSON.stringify(expenseQueryResult.rows));
                var projectIDs = [], projectIDparams = [];
                for(let i =1 ;i <= expenseQueryResult.rowCount ; i++)
                {
                    console.log('Inside For Loop ');
                    projectIDs.push(expenseQueryResult.rows[i-1].project_name__c);
                    projectIDparams.push('$'+i);
                }

                let projectQueryText = 'SELECT id, sfid , name FROM salesforce.Milestone1_Project__c WHERE sfid IN ( '+projectIDparams.join(',')+' )';
                console.log('projectQueryText  : '+projectQueryText);

                pool
                .query(projectQueryText,projectIDs)
                .then((projectQueryResult) => {
                    console.log('projectQueryResult  : '+JSON.stringify(projectQueryResult.rows));
                })
                .catch((projectQueryError) => {
                    console.log('projectQueryError   : '+projectQueryError.stack);
                })
                response.render('expense.ejs',{objUser : objUser, name : request.user.name, email : request.user.email, expenseList : expenseQueryResult.rows, projectList : objProjectList});
            }
            else
            {
                response.render('expense.ejs',{objUser: objUser, name : request.user.name, email : request.user.email, expenseList : expenseQueryResult.rows, projectList : objProjectList});
            }
    })
    .catch((expenseQueryError) => {
        console.log('expenseQueryError   '+expenseQueryError.stack);
        response.send(403);
    }) */

    response.render('expense.ejs',{objUser : objUser, name : request.user.name, email : request.user.email});
  
});


router.get('/expenseAllRecords',verify, async (request, response) => {

  let objUser = request.user;
  console.log('objUser   : '+JSON.stringify(objUser));

  pool
  .query('SELECT exp.id, exp.sfid, exp.Name , exp.isHerokuEditButtonDisabled__c, exp.Project_Name__c, exp.Approval_Status__c, exp.Amount_Claimed__c, exp.petty_cash_amount__c, exp.Conveyance_Amount__c, exp.Tour_bill_claim_Amount__c, exp.createddate, pro.sfid as prosfid, pro.name as proname FROM salesforce.Milestone1_Expense__c as exp JOIN salesforce.Milestone1_Project__c as pro ON exp.Project_name__c = pro.sfid WHERE exp.Incurred_By_Heroku_User__c = $1 AND exp.sfid != \'\'',['0030p000009y3OzAAI'])
  .then((expenseQueryResult) => {
      console.log('expenseQueryResult   : '+JSON.stringify(expenseQueryResult.rows));
          if(expenseQueryResult.rowCount > 0)
          {
              console.log('expenseQueryResult   : '+JSON.stringify(expenseQueryResult.rows));
              var projectIDs = [], projectIDparams = [];
              for(let i =1 ;i <= expenseQueryResult.rowCount ; i++)
              {
                  console.log('Inside For Loop ');
                  projectIDs.push(expenseQueryResult.rows[i-1].project_name__c);
                  projectIDparams.push('$'+i);
              }

              let expenseList = [];
              for(let i=0 ; i < expenseQueryResult.rows.length; i++)
              {
                let obj = {};
                let crDate = new Date(expenseQueryResult.rows[i].createddate);
               // crDate = crDate.setHours(crDate.getHours() + 5);
               // crDate = crDate.setMinutes(crDate.getMinutes() + 30);
                let strDate = crDate.toLocaleString();
                obj.sequence = i+1;
                obj.name = '<a href="'+expenseQueryResult.rows[i].sfid+'" data-toggle="modal" data-target="#popup" class="expId" id="name'+expenseQueryResult.rows[i].sfid+'"  >'+expenseQueryResult.rows[i].name+'</a>';
                obj.projectName = expenseQueryResult.rows[i].proname;
                obj.approvalStatus = expenseQueryResult.rows[i].approval_status__c;
                obj.totalAmount = '<span id="amount'+expenseQueryResult.rows[i].sfid+'" >'+expenseQueryResult.rows[i].amount_claimed__c+'</span>';
                obj.pettyCashAmount = expenseQueryResult.rows[i].petty_cash_amount__c;
                obj.conveyanceVoucherAmount = expenseQueryResult.rows[i].conveyance_amount__c;
                obj.tourBillAmount = expenseQueryResult.rows[i].tour_bill_claim_amount__c;
                obj.createdDate = strDate;
                if(expenseQueryResult.rows[i].isherokueditbuttondisabled__c)
                  obj.editButton = '<button  disabled  data-toggle="modal" data-target="#popupEdit" class="btn btn-primary expIdEditMode"   id="edit'+expenseQueryResult.rows[i].sfid+'" >Edit</button>';
                else
                  obj.editButton = '<button    data-toggle="modal" data-target="#popupEdit" class="btn btn-primary expIdEditMode"   id="edit'+expenseQueryResult.rows[i].sfid+'" >Edit</button>';
                obj.approvalButton = '<button   class="btn btn-primary expIdApproval"  style="color:white;" id="'+expenseQueryResult.rows[i].sfid+'" >Submit For Approval</button>';
                expenseList.push(obj);
                /* disabled="'+expenseQueryResult.rows[i].isherokueditbuttondisabled__c+'" */
              }


          
              response.send({objUser : objUser, expenseList : expenseList});
          }
          else
          {
              response.send({objUser: objUser, expenseList : []});
          }
  })
  .catch((expenseQueryError) => {
      console.log('expenseQueryError   '+expenseQueryError.stack);
      response.send({objUser: objUser, expenseList : []});
  })

})



router.post('/createExpense',(request, response) => {

   // var {expenseName, projectName} = request.body;
    console.log('request.body  '+JSON.stringify(request.body));

   const {taskname,projectname ,department, designation, employeeId, empCategory, approvalStatus, incurredBy} = request.body;
   console.log('taskname  '+taskname);
   console.log('projectname  '+projectname);
   console.log('department  '+department);
   console.log('designation  '+designation);
   console.log('employeeId  '+employeeId);
   console.log('empCategory  '+empCategory);
   console.log('approvalStatus  '+approvalStatus);
   console.log('incurredBy  '+incurredBy);

   pool
   .query('INSERT INTO salesforce.Milestone1_Expense__c (name,project_name__c,department__c,designation__c,Conveyance_Voucher_Employee_ID__c,Conveyance_Employee_Category_Band__c,Incurred_By_Heroku_User__c) values ($1,$2,$3,$4,$5,$6,$7)',[taskname,projectname,department,designation,employeeId,empCategory,incurredBy])
   .then((expenseInsertResult) => {     
            console.log('expenseInsertResult.rows '+JSON.stringify(expenseInsertResult.rows));
            response.send('Success');
   })
   .catch((expenseInsertError) => {
        console.log('expenseInsertError   '+expenseInsertError.stack);
        response.send('Error');
   })
 
});

router.get('/saved-expense-details',verify, async (request, response) => {

  let finaResponse = {};
  console.log('Expense request.user '+JSON.stringify(request.user));
  let objUser = request.user;
  finaResponse.objUser = objUser;


  let expenseId = request.query.expenseId;
  console.log('Hurrah expenseId '+expenseId);
  let expenseQueryText = 'SELECT id,sfid,Name, Project_Name__c, Department__c, Designation__c, '+
    'Conveyance_Voucher_Employee_ID__c,Conveyance_Employee_Category_Band__c,'+
    'Approval_Status__c, Amount_Claimed__c, Tour_bill_claim_Amount__c, petty_cash_amount__c, Conveyance_Amount__c '+
    'FROM salesforce.Milestone1_Expense__c WHERE sfid = $1';

  await
  pool
  .query(expenseQueryText,[expenseId])
  .then((expenseQueryResult) => {
      if(expenseQueryResult.rowCount > 0)
      {
        finaResponse.expenseDetails = expenseQueryResult.rows[0];
       
      }   
      else
        response.send({});
  })
  .catch((expenseQueryError) => {
        console.log('expenseQueryError  '+expenseQueryError.stack);
        response.send({});
  })

  await
  pool
  .query('SELECT sfid, Name, Team__c FROM salesforce.Team_Member__c WHERE Representative__c = $1 ;',[objUser.sfid])
  .then(teamMemberResult => {
    console.log('Name of TeamMemberId  : '+teamMemberResult.rows[0].name+'   sfid :'+teamMemberResult.rows[0].sfid);
    console.log('Team Id  : '+teamMemberResult.rows[0].team__c);
    console.log('Number of Team Member '+teamMemberResult.rows.length);

    var projectTeamparams = [], lstTeamId = [];
    for(var i = 1; i <= teamMemberResult.rows.length; i++) {
      projectTeamparams.push('$' + i);
      lstTeamId.push(teamMemberResult.rows[i-1].team__c);
    } 
    var projectTeamQueryText = 'SELECT sfid, Name, Project__c FROM salesforce.Project_Team__c WHERE Team__c IN (' + projectTeamparams.join(',') + ')';
    console.log('projectTeamQueryText '+projectTeamQueryText);
    
      pool
      .query(projectTeamQueryText,lstTeamId)
      .then((projectTeamResult) => {
          console.log('projectTeam Reocrds Length '+projectTeamResult.rows.length);
          console.log('projectTeam Name '+projectTeamResult.rows[0].name);

          var projectParams = [], lstProjectId = [];
          for(var i = 1; i <= projectTeamResult.rows.length; i++) {
            projectParams.push('$' + i);
            lstProjectId.push(projectTeamResult.rows[i-1].project__c);
          } 
          console.log('lstProjectId  : '+lstProjectId);
          let projetQueryText = 'SELECT sfid, Name FROM salesforce.Milestone1_Project__c WHERE sfid IN ('+ projectParams.join(',')+ ')';

          pool.query(projetQueryText, lstProjectId)
          .then((projectQueryResult) => { 
                console.log('Number of Projects '+projectQueryResult.rows.length);
                finaResponse.projectList = projectQueryResult.rows;
                response.send(finaResponse);
           })
          .catch((projectQueryError) => {

           })
        })   
       .catch((projectTeamQueryError)=> {

       })
    })
    .catch((teamMemberQueryError) => {

    })


});

router.post('/update-expense',verify,(request, response) => {

  console.log('Expense request.user '+JSON.stringify(request.user));
  let objUser = request.user;
 

    let formBody = request.body;
    console.log('formBody  :'+JSON.stringify(formBody));
    const {taskname,projectname ,department, designation, employeeId, empCategory, approvalStatus, incurredBy, expenseId} = request.body;
   console.log('taskname  '+taskname);
   console.log('projectname  '+projectname);
   console.log('department  '+department);
   console.log('designation  '+designation);
   console.log('employeeId  '+employeeId);
   console.log('empCategory  '+empCategory);
   console.log('approvalStatus  '+approvalStatus);
   console.log('incurredBy  '+incurredBy);
   console.log('expense Id '+expenseId);

   let updateExpenseQuery = 'UPDATE salesforce.Milestone1_Expense__c SET '+
                             'name = \''+taskname+'\', '+
                             'project_name__c = \''+projectname+'\' , '+
                             'department__c = \''+department+'\' , '+
                             'designation__c = \''+designation+'\', '+
                             'Conveyance_Voucher_Employee_ID__c = \''+employeeId+'\' ,'+
                             'Conveyance_Employee_Category_Band__c = \''+empCategory+'\' ,'+
                             'Incurred_By_Heroku_User__c  = \''+incurredBy+'\' '+
                             'WHERE sfid = $1';
  console.log('updateExpenseQuery  '+updateExpenseQuery);

   pool
   .query(updateExpenseQuery,[expenseId])
   .then((expenseInsertResult) => {     
            console.log('expenseInsertResult.rows '+JSON.stringify(expenseInsertResult.rows));
            response.send('Success');
   })
   .catch((expenseInsertError) => {
        console.log('expenseInsertError   '+expenseInsertError.stack);
        response.send('Error');
   })

});


router.get('/expenseRecordDetails',(request, response) =>{

    var expenseId = request.query.expenseId;
    console.log('Hurrah expenseId '+expenseId);

});

router.get('/details', async (request, response) => {

    var expenseId = request.query.expenseId;
    console.log('Hurrah expenseId '+expenseId);

    var expenseQueryText = 'SELECT id,sfid,Name, Project_Name__c, Department__c, Designation__c, '+
    'Conveyance_Voucher_Employee_ID__c,Conveyance_Employee_Category_Band__c,'+
    'Approval_Status__c, Amount_Claimed__c, Tour_bill_claim_Amount__c, petty_cash_amount__c, Conveyance_Amount__c '+
    'FROM salesforce.Milestone1_Expense__c WHERE sfid = $1';


    var pettyCashQueryText = 'SELECT id, sfid, name, Activity_Code__c, Bill_No__c, Bill_Date__c,Nature_of_exp__c, Amount__c FROM salesforce.Petty_Cash_Expense__c WHERE Expense__c = $1';
    var conveyanceQueryText = 'SELECT id, sfid, Name, Amount__c, Mode_of_Conveyance__c, From__c FROM salesforce.Conveyance_Voucher__c WHERE Expense__c = $1';
    var tourBillClaimQueryText = 'SELECT id, sfid, Name, Grand_Total__c FROM salesforce.Tour_Bill_Claim__c WHERE Expense__c = $1 ';
    
    var objData =  {};

    try{

        await pool.query(expenseQueryText,[expenseId])
        .then((expenseQueryResult) => {
                console.log('Expense Result '+JSON.stringify(expenseQueryResult.rows));
                objData.Expense = expenseQueryResult.rows;
        })
        .catch(expenseQueryError => console.log('expenseQueryError   :'+expenseQueryError.stack))

  
        await pool.query(pettyCashQueryText,[expenseId])
        .then(pettyCashQueryResult => {console.log('Petty Cash Result '+JSON.stringify(pettyCashQueryResult.rows))
                objData.PettyCash = pettyCashQueryResult.rows;
        })
        .catch(pettyCashQueryError => console.log('pettyCashQueryError  : '+pettyCashQueryError.stack))
        
        await pool.query(conveyanceQueryText,[expenseId])
        .then((conveyanceQueryResult) => {
                console.log('Conveyance Result '+JSON.stringify(conveyanceQueryResult.rows));
                objData.Conveyance = conveyanceQueryResult.rows;
        })
        .catch(conveyanceQueryError => console.log('conveyanceQueryError   :'+conveyanceQueryError.stack))

        await pool.query(tourBillClaimQueryText,[expenseId])
        .then((tourBillClaimResult) => {
            console.log('Tour BillClaim Result '+JSON.stringify(tourBillClaimResult.rows));
            objData.TourBillClaim = tourBillClaimResult.rows;
        })
        .catch(tourBillClaimQueryError => console.log('tourBillClaimQueryError   :'+tourBillClaimQueryError.stack))
      
       
    }
    catch(err){
        console.log('error async await '+err);
    }

    console.log('objData '+JSON.stringify(objData));
    response.send(objData);
});




var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG|JPG|GIF)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

console.log('process.env.CLOUD_NAME  : '+process.env.CLOUD_NAME);
console.log('process.env.API_ID  : '+process.env.API_ID);
console.log('process.env.API_SECRET  : '+process.env.API_SECRET);

var upload = multer({ storage: storage, fileFilter: imageFilter})
cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_ID, 
  api_secret: process.env.API_SECRET
}); 


router.get('/pettyCash/:parentExpenseId',verify,(request, response) => {

  var parentExpenseId = request.params.parentExpenseId;
  console.log('parentExpenseId  '+parentExpenseId);
  console.log('Expense request.user '+JSON.stringify(request.user));
  var userId = request.user.sfid; 
  var objUser = request.user;
  console.log('Expense userId : '+userId);

  response.render('pettycash',{name:request.user.name, email:request.user.email, parentExpenseId:parentExpenseId });
});



router.post('/savePettyCashForm', (request, response) => {

    console.log('Body Result '+JSON.stringify(request.body));  
    console.log('Now For Each   lllllllllLoop !');
    console.log('Hello Work done !');

    let numberOfRows,lstPettyCash = [];
    if(typeof(request.body.bill_no) == 'object')
    {
         numberOfRows = request.body.bill_no.length;
          for(let i=0; i< numberOfRows ; i++)
          {
              let pettyCashValues = [];
              pettyCashValues.push(request.body.bill_no[i]);
              pettyCashValues.push(request.body.bill_date[i]);
              pettyCashValues.push(request.body.activity_code[i]);
              pettyCashValues.push(request.body.desc[i]);
              pettyCashValues.push(request.body.nature_exp[i]);
              pettyCashValues.push(request.body.amount[i]);
              pettyCashValues.push(request.body.imgpath[i]);
              pettyCashValues.push(request.body.parentExpenseId[i]);
              lstPettyCash.push(pettyCashValues);
              
          }    
          console.log('lstPettyCash  '+JSON.stringify(lstPettyCash));
    }
    else
    {
        numberOfRows = 1;
        for(let i=0; i< numberOfRows ; i++)
        {
            let pettyCashValues = [];
            pettyCashValues.push(request.body.bill_no);
            pettyCashValues.push(request.body.bill_date);
            pettyCashValues.push(request.body.activity_code);
            pettyCashValues.push(request.body.desc);
            pettyCashValues.push(request.body.nature_exp);
            pettyCashValues.push(request.body.amount);
            pettyCashValues.push(request.body.imgpath);
            pettyCashValues.push(request.body.parentExpenseId);
            lstPettyCash.push(pettyCashValues);
            
        }    
        console.log('lstPettyCash  '+JSON.stringify(lstPettyCash));
    }
    
    
    let pettyCashInsertQuery = format('INSERT INTO salesforce.Petty_Cash_Expense__c (bill_no__c, bill_date__c,activity_Code__c,description_of_activity_expenses__c,nature_of_exp__c,amount__c,heroku_image_url__c,expense__c) VALUES %L returning id', lstPettyCash);

    pool.query(pettyCashInsertQuery)
    .then((pettyCashQueryResult) => {
        console.log('pettyCashQueryResult  '+JSON.stringify(pettyCashQueryResult.rows));
        response.send('Saved Data Succesfully !');
    })
    .catch((pettyCashQueryError) => {
      console.log('pettyCashQueryError  '+pettyCashQueryError);
      response.send('Error Occured !');
    })
});

router.post('/uploadImage',upload.any(),async (request, response) => {

    console.log('uploadImage  Called !');
    console.log('request.files[0].path   '+request.files[0].path);
    try{
    cloudinary.uploader.upload(request.files[0].path, function(error, result) {
 
        if(error){
          console.log('cloudinary  error' + error);
        }
        console.log('cloudinary result '+JSON.stringify(result));
        response.send(result);
      });
   }
   catch(Ex)
   {
        console.log('Exception '+ex);
        console.log('Exception '+JSON.stringify(ex));
   }
});



router.get('/conveyanceVoucher/:parentExpenseId',verify,(request, response) => {

  var parentExpenseId = request.params.parentExpenseId;
  console.log('conveyanceVoucher parentExpenseId '+parentExpenseId);
  console.log('Expense request.user '+JSON.stringify(request.user));
  var userId = request.user.sfid; 
  var objUser = request.user;
  console.log('Expense userId : '+userId);

  response.render('conveyanceVoucher',{name:request.user.name, email:request.user.email, parentExpenseId: parentExpenseId });

});

router.post('/conveyanceform',(request,response) => {  

    console.log('conveyanceform Body Result  : '+JSON.stringify(request.body));

    let numberOfRows ,lstConveyance = [];
    if(typeof(request.body.from) == 'object')
    {
        numberOfRows = request.body.from.length;
        for(let i=0; i<numberOfRows ; i++)
        {
            let conveyanceValues = [];
            conveyanceValues.push(request.body.from[i]);
            conveyanceValues.push(request.body.to[i]);
            conveyanceValues.push(request.body.activity_code[i]);
            conveyanceValues.push(request.body.purposeoftravel[i]);
            conveyanceValues.push(request.body.modeofconveyance[i]);
            conveyanceValues.push(request.body.kmtravelled[i]);
            conveyanceValues.push(request.body.amount[i]);
            conveyanceValues.push(request.body.imgpath[i]);
            conveyanceValues.push(request.body.parentExpenseId[i]);
            lstConveyance.push(conveyanceValues);
        }   
        console.log('lstConveyance   : '+lstConveyance);
    }
    else
    {
        numberOfRows = 1;
        for(let i=0; i<numberOfRows ; i++)
        {
            let conveyanceValues = [];
            conveyanceValues.push(request.body.from);
            conveyanceValues.push(request.body.to);
            conveyanceValues.push(request.body.activity_code);
            conveyanceValues.push(request.body.purposeoftravel);
            conveyanceValues.push(request.body.modeofconveyance);
            conveyanceValues.push(request.body.kmtravelled);
            conveyanceValues.push(request.body.amount);
            conveyanceValues.push(request.body.imgpath);
            conveyanceValues.push(request.body.parentExpenseId);
            lstConveyance.push(conveyanceValues);
        }   
        console.log('lstConveyance   : '+lstConveyance);
    }

    
    
    let conveyanceVoucherInsertQuery = format('INSERT INTO salesforce.Conveyance_Voucher__c (From__c, To__c,Activity_Code__c, Purpose_of_Travel__c,Mode_of_Conveyance__c,Kms_Travelled__c,Amount__c,Heroku_Image_URL__c, Expense__c) VALUES %L returning id', lstConveyance);
    pool.query(conveyanceVoucherInsertQuery)
    .then((conveyanceQueryResult) => {
        console.log('conveyanceQueryResult :  '+JSON.stringify(conveyanceQueryResult.rows));
        response.send('Conveyance Saved Successfully !');
    })
    .catch((conveyanceQueryError) => {
      console.log('conveyanceQueryError  '+conveyanceQueryError);
      response.send('Error Occured !');
    })

    

});


router.get('/addExpense', (request, response) => {
    response.render('expenseAddEditForm');
});


router.get('/activityCodes',async (request, response) => {

    let parentExpenseId = request.query.parentExpenseId;
    console.log('parentExpenseId   : '+parentExpenseId);
    let projectId = '';

    await
    pool.query('SELECT project_name__c FROM salesforce.milestone1_expense__c WHERE sfid= $1',[parentExpenseId])
    .then((expenseQueryResult) => {
        console.log('expenseQueryResult  '+JSON.stringify(expenseQueryResult.rows));
        if(expenseQueryResult.rowCount > 0)
              projectId = expenseQueryResult.rows[0].project_name__c;
    })
    .catch((expenseQueryError)=> {
        console.log('expenseQueryError  '+expenseQueryError.stack);
    })

    console.log('projectId  :  '+projectId);
    await
    pool
    .query('SELECT sfid, name FROM salesforce.Milestone1_Milestone__c WHERE Project__c = $1 AND name != \'Timesheet Category\'',[projectId])
    .then((projectTaskCategoryResult) => {
            console.log('projectTaskCategoryResult   '+JSON.stringify(projectTaskCategoryResult.rows));
            
            if(projectTaskCategoryResult.rowCount > 0)
            {
                var milestoneIds = [], milestoneIdParams = [];
                for(let i= 0; i< projectTaskCategoryResult.rows.length ; i++)
                {
                    milestoneIds.push(projectTaskCategoryResult.rows[i].sfid);
                    milestoneIdParams.push('$'+(i+1));      
                }
            }

            var taskQueryText =  'SELECT sfid, name , Activity_Code__c FROM salesforce.Milestone1_Task__c WHERE Project_Milestone__c IN ('+milestoneIdParams.join(',')+')';
            console.log('taskQueryText   '+taskQueryText);
            pool
            .query(taskQueryText,milestoneIds)
            .then((taskQueryResult) => {    
                    console.log('taskQueryResult  '+JSON.stringify(taskQueryResult.rows));
                    response.send(taskQueryResult.rows);
            })
            .catch((taskQueryError) => {
                console.log('taskQueryError   : '+taskQueryError.stack);
                response.send(500);
            })

    })
    .catch((projectTaskCategoryError) => {
        console.log('projectTaskCategoryError   '+projectTaskCategoryError.stack);
        response.send(500);
    })
    
});



router.post('/sendForApproval',verify,(request, response) => {
    console.log('hekllo');
    let objUser = request.user;
    let expenseId = request.body.selectedExpenseId;
    let expenseName = request.body.expenseName;
    let totalAmount = request.body.totalAmount;
    let comment = request.body.comment;
    console.log('comment  :  '+comment);
    console.log('expenseId  :  '+expenseId+'  expenseName  : '+expenseName+'  totalAmount : '+totalAmount);

    let approvalStatus = 'Pending';
    let updateExpenseQuery = 'UPDATE salesforce.Milestone1_Expense__c SET '+  
                             'isHerokuEditButtonDisabled__c = true , '+
                             'approval_status__c = \''+approvalStatus+'\' '+
                             'WHERE sfid = $1';
     console.log('updateExpenseQuery :  '+updateExpenseQuery);

    pool.query(updateExpenseQuery,[expenseId])
    .then((expenseUpdateQueryResult) => {
          console.log('expenseUpdateQueryResult  : '+JSON.stringify(expenseUpdateQueryResult));
    })
    .catch((expenseUpdateQueryError) => {
          console.log('expenseUpdateQueryError  : '+expenseUpdateQueryError.stack);
    });


    let managerId = '';
    pool
    .query('SELECT manager__c FROM salesforce.Team__c WHERE sfid IN (SELECT team__c FROM salesforce.Team_Member__c WHERE Representative__c = $1)',[objUser.sfid])
    .then((teamMemberQueryResult) => {
          console.log('teamMemberQueryResult   : '+JSON.stringify(teamMemberQueryResult.rows));
          if(teamMemberQueryResult.rowCount > 0)
          {
            let lstManagerId = teamMemberQueryResult.rows.filter((eachRecord) => {
                                    if(eachRecord.manager__c != null)
                                        return eachRecord;
                              })
            managerId = lstManagerId[0].manager__c;
            console.log('managerId   : '+managerId);

            pool.query('INSERT INTO salesforce.Custom_Approval__c (Approval_Type__c,Submitter__c, Assign_To__c ,Expense__c, Comment__c, Status__c, Record_Name__c,amount__c) values($1, $2, $3, $4, $5, $6, $7, $8) ',['Expense',objUser.sfid, managerId, expenseId, comment, 'Pending', expenseName, totalAmount ])
            .then((customApprovalQueryResult) => {
                    console.log('customApprovalQueryResult  '+JSON.stringify(customApprovalQueryResult));
            })
            .catch((customApprovalQueryError) => {
                    console.log('customApprovalQueryError  '+customApprovalQueryError.stack);
            })
          }
    })
    .catch((teamMemberQueryError) => {
          console.log('teamMemberQueryError   :  '+teamMemberQueryError.stack);
    })

    response.send('OKOKOK');

});



router.get('/pettycashlistview',verify,(request, response) => {

  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let expenseId = request.query.expenseId;
  console.log('expenseId  '+expenseId);

  response.render('pettycashlistview',{objUser,expenseId});
})

router.get('/getpettycashlist',verify,(request, response) => {

  let objUser = request.user;
  let expenseId = request.query.expenseId;
  console.log('expenseId  '+expenseId);
  pool
  .query('SELECT sfid, name, bill_no__c, Bill_Date__c ,Nature_of_exp__c ,createddate from salesforce.Petty_Cash_Expense__c WHERE expense__c = $1',[expenseId])
  .then((pettyCashQueryResult) => {
        console.log('pettyCashQueryResult  '+JSON.stringify(pettyCashQueryResult.rows));
          if(pettyCashQueryResult.rowCount > 0)
          {
              //response.send(pettyCashQueryResult.rows);

              let modifiedPettyCashList = [],i =1;
              pettyCashQueryResult.rows.forEach((eachRecord) => {
                let obj = {};
                let createdDate = new Date(eachRecord.createddate);
                let strDate = createdDate.toLocaleString();
                let strBillDate = new Date(eachRecord.bill_date__c).toLocaleString();
                obj.sequence = i;
                obj.name = '<a href="#" class="pettyCashTag" id="'+eachRecord.sfid+'" >'+eachRecord.name+'</a>';
                obj.billNo = eachRecord.bill_no__c;
                obj.natureOfExpense = eachRecord.nature_of_exp__c;
                obj.billDate = strBillDate;
                obj.createDdate = strDate;

                i= i+1;
                modifiedPettyCashList.push(obj);
              })
              response.send(modifiedPettyCashList);
          }
          else
          {
              response.send([]);
          }
  })
  .catch((pettyCashQueryError) => {
        console.log('pettyCashQueryError  '+pettyCashQueryError.stack);
        response.send([]);
  })

  console.log('objUser  : '+JSON.stringify(objUser));

})



router.get('/getpettycashDetail',verify,(request, response) => {

  let pettyCashId = request.query.pettyCashId;
  console.log('pettyCashId  : '+pettyCashId);
  let queryText = 'SELECT pettycash.sfid, pettycash.description_of_activity_expenses__c, pettycash.amount__c, pettycash.name as pettycashname ,exp.name as expname, pettycash.bill_no__c, pettycash.Bill_Date__c ,pettycash.Nature_of_exp__c ,pettycash.createddate '+
                   'FROM salesforce.Petty_Cash_Expense__c pettycash '+ 
                   'INNER JOIN salesforce.Milestone1_Expense__c exp '+
                   'ON pettycash.Expense__c =  exp.sfid '+
                   'WHERE  pettycash.sfid= $1 ';

  pool
  .query(queryText,[pettyCashId])
  .then((pettyCashQueryResult) => {
        console.log('pettyCashQueryResult  '+JSON.stringify(pettyCashQueryResult.rows));
        if(pettyCashQueryResult.rowCount > 0)
        {
          response.send(pettyCashQueryResult.rows);
        }
        else
        {
          response.send({});
        }
         
  })
  .catch((pettyCashQueryError) => {
        console.log('pettyCashQueryError  '+pettyCashQueryError.stack);
        response.send({});
  })

})
/*****  Anukarsh Conveyance ListView */

router.get('/ConveyanceListView',verify,(request, response) => {

  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let expenseId = request.query.expenseId;
  console.log('expenseId  '+expenseId);

  response.render('ConveyanceListView',{objUser,expenseId});
})

router.get('/getconveyancelist' ,verify,(request,response) => {
  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let expenseId = request.query.expenseId;
  console.log('expenseId conveyance '+expenseId);
  pool
  .query('SELECT sfid, name, Mode_of_Conveyance__c, Purpose_of_Travel__c ,createddate from salesforce.Conveyance_Voucher__c WHERE expense__c = $1',[expenseId])
  .then((conveyanceQueryResult)=>{
    console.log('conveyanceQueryResult :'+conveyanceQueryResult.rowCount);
    if(conveyanceQueryResult.rowCount>0)
    {
      let modifiedConveyanceList = [],i =1;
      
      conveyanceQueryResult.rows.forEach((eachRecord) => {
        let obj = {};
        let createdDate = new Date(eachRecord.createddate);
        let strDate = createdDate.toLocaleString();
        obj.sequence = i;
        obj.name = '<a href="#" class="conveyanceTag" id="'+eachRecord.sfid+'" >'+eachRecord.name+'</a>';
        obj.TravellingPurpose = eachRecord.purpose_of_travel__c;
        obj.createDdate = strDate;
        obj.modeOfTravel = eachRecord.mode_of_conveyance__c;
        

        i= i+1;
        modifiedConveyanceList.push(obj);
      })
      response.send(modifiedConveyanceList);
    }
    else{
      response.send([]);
    }
    
  })
  .catch((conveyanceQueryError)=>{
    console.log('conveyanceQueryError'+conveyanceQueryError.stack);
  })
} )

router.get('/TourBillClaimListView',verify,(request,response)=>{
  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let expenseId = request.query.expenseId;
  console.log('expenseId  '+expenseId);

  response.render('TourBillClaimListView',{objUser,expenseId});
})

router.get('/gettourbillclaim',verify,(request,response)=>{
  let objUser = request.user;
  console.log('objUser TourBill : '+JSON.stringify(objUser));
  let expenseId = request.query.expenseId;
  console.log('expenseId TourBill '+expenseId);
  pool
  .query('SELECT sfid, name, grand_Total__c ,createddate from salesforce.Tour_Bill_Claim__c WHERE expense__c = $1',[expenseId])
  .then((tourBillClaimResult)=>{
    console.log('tourBillClaimResult '+tourBillClaimResult.rows);
    if(tourBillClaimResult.rowCount>0)
    {
          let modifiedTourBillList = [],i =1; 
      tourBillClaimResult.rows.forEach((eachRecord) => {
        let obj = {};
        let createdDate = new Date(eachRecord.createddate);
        let strDate = createdDate.toLocaleString();
        obj.sequence = i;
        obj.name = '<a href="'+eachRecord.sfid+'"  data-toggle="modal" data-target="#popup" class="tourBillId"  id="" >'+eachRecord.name+'</a>';
        obj.grandTotal = eachRecord.grand_total__c;
        obj.createDdate = strDate;
        i= i+1;
        modifiedTourBillList.push(obj);
      })
      response.send(modifiedTourBillList); 
    }
    else{
      response.send([]);
    }
  })
  .catch((tourBillClaimQueryError)=>{
    console.log('tourBillClaimQueryError '+tourBillClaimQueryError.stack);

  })

})




router.get('/getConveyanceVoucherDetail',verify,(request, response) => {

  let  conveyanceId= request.query.conveyanceId;
  console.log('conveyanceId  : '+conveyanceId);
  let queryText = 'SELECT conVoucher.sfid, conVoucher.amount__c, conVoucher.mode_of_conveyance__c,conVoucher.purpose_of_travel__c, conVoucher.name as conveyancename ,exp.name as expname,conVoucher.createddate '+
                   'FROM salesforce.Conveyance_Voucher__c conVoucher '+ 
                   'INNER JOIN salesforce.Milestone1_Expense__c exp '+
                   'ON conVoucher.Expense__c =  exp.sfid '+
                   'WHERE  conVoucher.sfid= $1 ';

  pool
  .query(queryText,[conveyanceId])
  .then((conveyanceQueryResult) => {
        console.log('conveyanceQueryResult  '+JSON.stringify(conveyanceQueryResult.rows));
        if(conveyanceQueryResult.rowCount > 0)
        {
          response.send(conveyanceQueryResult.rows);
        }
        else
        {
          response.send({});
        }
         
  })
  .catch((conveyanceQueryError) => {
        console.log('conveyanceQueryError  '+conveyanceQueryError.stack);
        response.send({});
  })

})

router.get('/getAirBusListView',verify,(request,response)=>{
  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let tourbillId = request.query.tourBillClaimId;

  console.log('getAirBusListView tourbillId:'+tourbillId);

  response.render('airRailBusListView', {tourbillId});
})

router.get('/getAirbusDetalList',verify,(request,response)=>{
   let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let tourbillId = request.query.tourbillId;
  console.log('TourbillId'+tourbillId);
  pool
  .query('SELECT sfid, name, Amount__c,Departure_Station__c,Arrival_Station__c ,createddate from salesforce.Air_Rail_Bus_Fare__c WHERE Tour_Bill_Claim__c = $1',[tourbillId])
  .then((airBusQueryResult)=>{
    console.log('airBusQueryResult '+airBusQueryResult.rows);
    if(airBusQueryResult.rowCount>0)
    {
          let modifiedAirBuslList = [],i =1; 
          airBusQueryResult.rows.forEach((eachRecord) => {
        let obj = {};
        let createdDate = new Date(eachRecord.createddate);
        let strDate = createdDate.toLocaleString();
        obj.sequence = i;
        obj.departure=eachRecord.departure_station__c
        obj.name = '<a href="#" class="airRailBusTag" id="'+eachRecord.sfid+'" >'+eachRecord.name+'</a>';
        obj.amount = eachRecord.amount__c;
        obj.createDdate = strDate;
        obj.arrival=eachRecord.arrival_station__c;
        obj.editAction = '<button href="#" class="btn btn-primary editAirRailBus" id="'+eachRecord.sfid+'" >Edit</button>'

        i= i+1;
        modifiedAirBuslList.push(obj);
      })
      response.send(modifiedAirBuslList); 
    }
    else{
      response.send([]);
    }
  })
  .catch((airBusQuerryError)=>{

  })
});

router.get('/getAirRailBus',verify,(request,response)=>{
  let tourbillId = request.query.tourbillId;
  console.log('tourbillId  : '+tourbillId);
  let queryText = 'SELECT airRail.sfid, airRail.Departure_Station__c,airRail.arrival_station__c,airRail.Departure_Date__c,airRail.Arrival_Date__c, airRail.amount__c, airRail.name as airbusrailname ,tourBill.name as tourbillname,airRail.createddate '+
                   'FROM salesforce.Air_Rail_Bus_Fare__c airRail '+ 
                   'INNER JOIN salesforce.Tour_Bill_Claim__c tourBill '+
                   'ON airRail.Tour_Bill_Claim__c =  tourBill.sfid '+
                   'WHERE  airRail.sfid= $1 ';

  pool
  .query(queryText,[tourbillId])
  .then((AirRailBusQueryResult) => {
        console.log('AirRailBusQueryResult  '+JSON.stringify(AirRailBusQueryResult.rows));
        if(AirRailBusQueryResult.rowCount > 0)
        {
          response.send(AirRailBusQueryResult.rows);
        }
        else
        {
          response.send({});
        }
         
  })
  .catch((AirRailBusQueryError) => {
        console.log('AirRailBusQueryError  '+AirRailBusQueryError.stack);
        response.send({});
  })

});

router.get('/conveyanceChargesListView',verify,(request,response)=>{
  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let tourbillId = request.query.tourBillClaimId;

  console.log('getConveyanceView tourbillId:'+tourbillId);

  response.render('ConveyanceView', {tourbillId});
})

router.get('/getConveyanceDetalList',verify,(request,response)=>{

  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let tourbillId = request.query.tourbillId;
  console.log('TourbillId Conveyamne'+tourbillId);
  pool
  .query('SELECT sfid, name, Amount__c,Date__c,Place__c ,createddate from salesforce.Conveyance_Charges__c WHERE Tour_Bill_Claim__c = $1',[tourbillId])
  .then((ConveyanceQueryResult)=>{
    console.log('ConveyanceQueryResult '+JSON.stringify(ConveyanceQueryResult.rows));
    if(ConveyanceQueryResult.rowCount>0)
    {
          let modifiedAirBuslList = [],i =1; 
          ConveyanceQueryResult.rows.forEach((eachRecord) => {
        let obj = {};
        let createdDate = new Date(eachRecord.createddate);
        let strDate = createdDate.toLocaleString();

        let strDate2 = new Date(eachRecord.date__c);
        let strDate3 = strDate2.toLocaleString();
        obj.sequence = i;
        obj.place=eachRecord.place__c;
        obj.name = '<a href="#" class="conveyanceViewTag" id="'+eachRecord.sfid+'" >'+eachRecord.name+'</a>';
        obj.amount = eachRecord.amount__c;
        obj.createDdate = strDate;
        obj.dated=strDate3;
        obj.editAction = '<button href="#" class="btn btn-primary editConveyance" id="'+eachRecord.sfid+'" >Edit</button>'
      
           i= i+1;
        modifiedAirBuslList.push(obj);
      })
      response.send(modifiedAirBuslList); 
    }
    else{
      response.send([]);
    }
  })
  .catch((ConveyanceQueryError)=>{
    console.log('ConveyanceQueryError '+ConveyanceQueryError.stack);

  })
});

router.get('/getConveyanceDetail',verify,(request,response)=>{

  let tourbillId = request.query.tourbillId;
  console.log('tourbillId  : '+tourbillId);
  let queryText = 'SELECT conveyancename.sfid, conveyancename.place__c, conveyancename.amount__c,conveyancename.date__c, conveyancename.name as conveyname ,tourBill.name as tourbillname,conveyancename.createddate '+
                   'FROM salesforce.Conveyance_Charges__c conveyancename '+ 
                   'INNER JOIN salesforce.Tour_Bill_Claim__c tourBill '+
                   'ON conveyancename.Tour_Bill_Claim__c =  tourBill.sfid '+
                   'WHERE  conveyancename.sfid= $1 ';

  pool
  .query(queryText,[tourbillId])
  .then((conveyanceQueryResult) => {
        console.log('conveyanceQueryResult tourill  '+JSON.stringify(conveyanceQueryResult.rows));
        if(conveyanceQueryResult.rowCount > 0)
        {
          response.send(conveyanceQueryResult.rows);
        }
        else
        {
          response.send({});
        }
         
  })
  .catch((conveyanceQueryError) => {
        console.log('conveyanceQueryError  '+conveyanceQueryError.stack);
        response.send({});
  })


})



router.get('/boardingLodgingListView',verify,(request,response)=>{
  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let tourbillId = request.query.tourBillClaimId;

  console.log('Boarding/Lodging tourbillId:'+tourbillId);

  response.render('boardingLodging', {tourbillId});

});
router.get('/getBoardingLodgingDetalList',verify,(request,response)=>{

  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let tourbillId = request.query.tourbillId;
  console.log('TourbillId Boarding'+tourbillId);
  pool
  .query('SELECT sfid, name, Total_Amount__c,From__c,	To__c,Place_Journey__c ,createddate from salesforce.Boarding_Lodging__c WHERE Tour_Bill_Claim__c = $1',[tourbillId])
  .then((BoardingQueryResult)=>{
    console.log('BoardingQueryResult '+BoardingQueryResult.rows);
    if(BoardingQueryResult.rowCount>0)
    {
          let modifiedAirBuslList = [],i =1; 
          BoardingQueryResult.rows.forEach((eachRecord) => {
        let obj = {};
        let createdDate = new Date(eachRecord.createddate);
        let strDate = createdDate.toLocaleString();

        let strFrom = new Date(eachRecord.from__c);
        let strDateFrom = strFrom.toLocaleString();
        let strto = new Date(eachRecord.to__c);
        let strDateTo = strto.toLocaleString();
        obj.sequence = i;
        obj.place=eachRecord.place_journey__c;
        obj.name = '<a href="#" class="boardingTag" id="'+eachRecord.sfid+'" >'+eachRecord.name+'</a>';
        obj.amount = eachRecord.total_amount__c;
        obj.from=strDateFrom;
        obj.to=strDateTo;
        obj.createDdate = strDate;
        obj.editAction = '<button href="#" class="btn btn-primary editBoarding" id="'+eachRecord.sfid+'" >Edit</button>'
        i= i+1;
        modifiedAirBuslList.push(obj);
      })
      response.send(modifiedAirBuslList); 
    }
    else{
      response.send([]);
    }
  })
  .catch((BoardingQueryError)=>{
    console.log('BoardingQueryError '+BoardingQueryError.stack);

  })
});


router.get('/getBoardingDetail',verify,(request,response)=>{
  let tourbillId = request.query.tourbillId;
  console.log('tourbillId  : '+tourbillId);
  let queryText = 'SELECT boradLoad.sfid,boradLoad.No_of_Days__c,boradLoad.Stay_Option__c,boradLoad.Place_Journey__c, boradLoad.total_amount__c, boradLoad.name as boardingname ,tourBill.name as tourbillname,boradLoad.createddate '+
                   'FROM salesforce.Boarding_Lodging__c boradLoad '+ 
                   'INNER JOIN salesforce.Tour_Bill_Claim__c tourBill '+
                   'ON boradLoad.Tour_Bill_Claim__c =  tourBill.sfid '+
                   'WHERE  boradLoad.sfid= $1 ';

  pool
  .query(queryText,[tourbillId])
  .then((QueryResult) => {
        console.log('QueryResult  '+JSON.stringify(QueryResult.rows));
        if(QueryResult.rowCount > 0)
        {
          response.send(QueryResult.rows);
        }
        else
        {
          response.send({});
        }
         
  })
  .catch((QueryError) => {
        console.log('QueryError jsfkjj '+QueryError.stack);
        response.send({});
  })
});



router.get('/telephoneFoodCharge',verify,(request,response)=>{
  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let tourbillId = request.query.tourBillClaimId;

  console.log('telephoneFoodCharge tourbillId:'+tourbillId);
  response.render('telephoneFoodChargeView', {tourbillId});
});

router.get('/gettelephoneFoodChargeDetalList',verify,(request,response)=>{
  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let tourbillId = request.query.tourbillId;
  console.log('Tourbill Telephone'+tourbillId);
  pool
  .query('SELECT sfid, name, Total_Amount__c,	Fooding_Expense__c,Laundry_Expense__c ,createddate from salesforce.Telephone_Fooding_Laundry_Expenses__c WHERE Tour_Bill_Claim__c = $1',[tourbillId])
  .then((telephonegQueryResult)=>{
    console.log('telephonegQueryResult '+telephonegQueryResult.rows);
    if(telephonegQueryResult.rowCount>0)
    {
          let modifiedFoodChargeList = [],i =1; 
          telephonegQueryResult.rows.forEach((eachRecord) => {
        let obj = {};
        let createdDate = new Date(eachRecord.createddate);
        let strDate = createdDate.toLocaleString();
        obj.sequence = i;
        obj.name = '<a href="#" class="telephoneChargeTag" id="'+eachRecord.sfid+'" >'+eachRecord.name+'</a>';
        obj.amount = eachRecord.total_amount__c;
        obj.fooding=eachRecord.fooding_expense__c;
        obj.laundry=eachRecord.laundry_expense__c;
        obj.createDdate = strDate;
        obj.editAction = '<button href="#" class="btn btn-primary editFooding" id="'+eachRecord.sfid+'" >Edit</button>'
           i= i+1;
           modifiedFoodChargeList.push(obj);
      })
      response.send(modifiedFoodChargeList); 
    }
    else{
      response.send([]);
    }
  })
  .catch((telephoneQueryError)=>{
    console.log('telephoneQueryError '+telephoneQueryError.stack);

  })
});

router.get('/gettelephoneFoodChargeDetail',verify,(request,response)=>{
  let tourbillId = request.query.tourbillId;
  console.log('tourbillId  : '+tourbillId);
  let queryText = 'SELECT charge.sfid, charge.total_amount__c,charge.Fooding_Expense__c,charge.Laundry_Expense__c, charge.name as chargegname ,tourBill.name as tourbillname,charge.createddate '+
                   'FROM salesforce.Telephone_Fooding_Laundry_Expenses__c charge '+ 
                   'INNER JOIN salesforce.Tour_Bill_Claim__c tourBill '+
                   'ON charge.Tour_Bill_Claim__c =  tourBill.sfid '+
                   'WHERE  charge.sfid= $1 ';

  pool
  .query(queryText,[tourbillId])
  .then((QueryResult) => {
        console.log('QueryResult  '+JSON.stringify(QueryResult.rows));
        if(QueryResult.rowCount > 0)
        {
          response.send(QueryResult.rows);
        }
        else
        {
          response.send({});
        }
         
  })
  .catch((QueryError) => {
        console.log('QueryError jsfkjj '+QueryError.stack);
        response.send({});
  })
});


router.get('/miscellaneousCharge',verify,(request,response)=>{
  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let tourbillId = request.query.tourBillClaimId;

  console.log('Miscellaneous tourbillId:'+tourbillId);
  response.render('MiscellaneousView', {tourbillId});

});

router.get('/getMiscellaneousDetailList',verify,(request,response)=>{
  let objUser = request.user;
  console.log('objUser  : '+JSON.stringify(objUser));
  let tourbillId = request.query.tourbillId;
  console.log('Miscellanous Telephone'+tourbillId);
  pool
  .query('SELECT sfid, name, 	Amount__c,Particulars_Mode__c,Date__c,Remarks__c ,createddate from salesforce.Miscellaneous_Expenses__c WHERE Tour_Bill_Claim__c = $1',[tourbillId])
  .then((miscellaneousQueryResult)=>{
    console.log('miscellaneousQueryResult '+JSON.stringify(miscellaneousQueryResult.rows));
    if(miscellaneousQueryResult.rowCount>0)
    {
          let modifiedList = [],i =1; 
          miscellaneousQueryResult.rows.forEach((eachRecord) => {
        let obj = {};
        let strDated = new Date(eachRecord.date__c);
        let dated = strDated.toLocaleString();
        let createdDate = new Date(eachRecord.createddate);
        let strDate = createdDate.toLocaleString();
        obj.sequence = i;
        obj.name = '<a href="#" class="miscellaneousTag" id="'+eachRecord.sfid+'" >'+eachRecord.name+'</a>';
        obj.amount = eachRecord.amount__c;
        obj.mode=eachRecord.particulars_mode__c;
        obj.remarks=eachRecord.remarks__c;
        obj.createDdate = strDate;
        obj.date=dated;
        obj.editAction = '<button href="#" class="btn btn-primary editMiscellanous" id="'+eachRecord.sfid+'" >Edit</button>'
    
            i= i+1;
           modifiedList.push(obj);
      })
      response.send(modifiedList); 
    }
    else{
      response.send([]);
    }
  })
  .catch((QueryError)=>{
    console.log('QueryError '+QueryError.stack);

  })
});

router.get('/getMiscellaneousChargeDetail',verify,(request,response)=>{
  
  let tourbillId = request.query.tourbillId;
  console.log('tourbillId  : '+tourbillId);
  let queryText = 'SELECT misChar.sfid, misChar.Amount__c,misChar.date__c,misChar.Particulars_Mode__c, misChar.name as chargegname,tourBill.sfid  as tourId ,tourBill.name as tourbillname,misChar.createddate '+
                   'FROM salesforce.Miscellaneous_Expenses__c misChar '+ 
                   'INNER JOIN salesforce.Tour_Bill_Claim__c tourBill '+
                   'ON misChar.Tour_Bill_Claim__c =  tourBill.sfid '+
                   'WHERE  misChar.sfid= $1 ';

  pool
  .query(queryText,[tourbillId])
  .then((QueryResult) => {
        console.log('QueryResult  '+JSON.stringify(QueryResult.rows));
        if(QueryResult.rowCount > 0)
        {
          response.send(QueryResult.rows);
        }
        else
        {
          response.send({});
        }
         
  })
  .catch((QueryError) => {
        console.log('QueryError jsfkjj '+QueryError.stack);
        response.send({});
  })

});



router.post('/updateAirRailBus',verify,(request,response)=>{

  let body = request.body;
  console.log('body  : '+JSON.stringify(body));

  response.send('Response Not Cleared !');
})
router.post('/updateConveyanceCharge',verify,(request,response)=>{
  let body = request.body;
  console.log('body  : '+JSON.stringify(body));

  response.send('Response Not Cleared !');
});

router.post('/updateBoardingCharge',verify,(request,response)=>{
  let body = request.body;
  console.log('body  : '+JSON.stringify(body));

  response.send('Response Not Cleared !');
})
router.post('/editFoodingForm',verify,(request,response)=>{
  let body = request.body;
  console.log('body  : '+JSON.stringify(body));
  response.send('Response Not Cleared !');
})

/**  Update */

router.post('/updateMiscellanoousCharge',verify,(request,response)=>{
  let body = request.body;
 // let ids=request.params.id;
 // console.log('ids '+ids);

  console.log('body  : '+JSON.stringify(body));
  const {miscellanouseName,tourName , particularMode, amount,dt,hide} = request.body;
  console.log('name  '+miscellanouseName);
  console.log('TourbillId  '+tourName);
  console.log('mode  '+particularMode);
  console.log('amount  '+amount);
  console.log('date  '+dt);
  console.log(' Miscellanous IDs '+hide);
  respond.send('not available');
  let Updatequerry = 'UPDATE salesforce.Miscellaneous_Expenses__c'+
                       'particulars_mode__c = \''+particularMode+'\', '+
                       'amount__c = \''+amount+'\', '+
                       'date__c = \''+dt+'\', '+
                       'Tour_Bill_Claim__c=\''+tourName+'\','+
                       'WHERE sfid = $1';
                       
                       console.log('Updatequerry'+Updatequerry);
                       response.send('okokokokoko');
/*
  let updateMiscelaneousQuery = 'UPDATE salesforce.Miscellaneous_Expenses__c '+
                            'name = \''+taskname+'\', '+
                            'project_name__c = \''+projectname+'\' , '+
                            'department__c = \''+department+'\' , '+
                            'designation__c = \''+designation+'\', '+
                            'Conveyance_Voucher_Employee_ID__c = \''+employeeId+'\' ,'+
                            'Conveyance_Employee_Category_Band__c = \''+empCategory+'\' ,'+
                            'Incurred_By_Heroku_User__c  = \''+incurredBy+'\' '+
                            'WHERE sfid = $1';
 console.log('updateMiscelaneousQuery  '+updateMiscelaneousQuery);

  pool
  .query(Updatequerry,[hide])
  .then((miscellaneousInsertResult) => {     
           console.log('miscellaneousInsertResult.rows '+JSON.stringify(Updatequerry.rows));
           response.send('Success');
  })
  .catch((updatetError) => {
       console.log('updatetError   '+updatetError.stack);
       response.send('Error');
  })
*/
});
module.exports = router;