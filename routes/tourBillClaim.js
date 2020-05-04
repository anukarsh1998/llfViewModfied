const Router = require('express-promise-router');
const router = new Router()
const pool = require('../db/dbConfig');
const verify = require('../config/verifyToken');
const format = require('pg-format');


router.get('/:parentExpenseId',verify, (request, response) => {

    let parentExpenseId = request.params.parentExpenseId;
    console.log('tourBillClaim parentExpenseId : '+parentExpenseId);
    console.log('Expense request.user '+JSON.stringify(request.user));
    var userId = request.user.sfid;
    console.log('Expense userId : '+userId);
    /*
        Here We need to pass expense Id to fetch tourBillClaim records 
    */
    console.log('Expense request.user '+JSON.stringify(request.user));

    var userId = request.user.sfid;
    console.log('Expense userId : '+userId);

    pool.query('SELECT Id, sfid, Name, Expense__c, Grand_Total__c FROM salesforce.Tour_Bill_Claim__c WHERE Expense__c = $1 ',[parentExpenseId])
    .then((tourBillClaimResult) => {
        console.log('tourBillClaimResult '+JSON.stringify(tourBillClaimResult.rows));
        //response.send(tourBillClaimResult.rows);
        response.render('tourBillExpenses',{ name : request.user.name, email : request.user.email, tourBillClaimRows : tourBillClaimResult.rows ,parentExpenseId : parentExpenseId});
    })
    .catch((tourBillClaimError) => {
        console.log('Tour Bill Claim Query Error '+tourBillClaimError.stack);
        response.render('tourBillExpenses',{ name : request.user.name, email : request.user.email, tourBillClaimRows : [] ,parentExpenseId : ''});
    }) 
});


router.post('/saveTourBillClaim',(request, response) => {

    console.log('okok');
    let {tourBillClaimName, parentExpenseId } = request.body;
    console.log('tourBillClaimName  '+tourBillClaimName+ ' parentExpenseId : '+parentExpenseId);
    console.log('tourBillClaimFormData  '+JSON.stringify(request.body));

    pool.query('INSERT INTO salesforce.Tour_Bill_Claim__c (name, expense__c) values($1, $2) returning id',[tourBillClaimName,parentExpenseId])
    .then((tourBillClaimInsertResult) => {
            console.log('tourBillClaimInsertResult '+JSON.stringify(tourBillClaimInsertResult));
            response.send('Success');
    })
    .catch((tourBillClaimInsertError) => {
        console.log('tourBillClaimInsertError  '+tourBillClaimInsertError.stack);
        response.send('Error Occured  !');
    })

    
})


router.get('/getRelatedTourBillClaimDetails/:tourBillClaimId', async (request, response) => {

    console.log('getRelatedTourBillClaimDetails  called !');
    var tourBillClaimId = request.params.tourBillClaimId; //request.query.tourBillClaimId;
    console.log('tourBillClaimId   '+tourBillClaimId);
    var objTourbillClaimRelatedData = {};

    await
    pool.query('SELECT Id, Name, Expense__c, Grand_Total__c FROM salesforce.Tour_Bill_Claim__c WHERE sfid = $1 ',[tourBillClaimId])
    .then((tourBillClaimResult) => {
        console.log('tourBillClaimResult '+JSON.stringify(tourBillClaimResult.rows));
        
        if(tourBillClaimResult.rowCount > 0)
        {
            objTourbillClaimRelatedData.tourBillClaim = tourBillClaimResult.rows[0];
        }
        
    })
    .catch((tourBillClaimError) => {
        console.log('Tour Bill Claim Query Error '+tourBillClaimError.stack);
        response.send(403);
    }) 


    var airRailBusQuery = 'SELECT sfid, Name, Departure_Date__c, Arrival_Date__c, Departure_Station__c,'+ 
    'Arrival_Station__c, Amount__c, Tour_Bill_Claim__c, Activity_Code__c, Project_Tasks__c '+
    'FROM salesforce.Air_Rail_Bus_Fare__c WHERE Tour_Bill_Claim__c = $1';
    await 
    pool
    .query(airRailBusQuery,[tourBillClaimId])
    .then((airRailBusQueryResult) => {
        console.log('airRailBusQueryResult.rows '+JSON.stringify(airRailBusQueryResult.rows));
        
        if(airRailBusQueryResult.rowCount > 0)
        {
            objTourbillClaimRelatedData.airBusRailFare = airRailBusQueryResult.rows;
        }
        
    })
    .catch((airRailBusQueryError) => {
    console.log('airRailBusQueryError '+airRailBusQueryError.stack);
    })



    var conveyanceChargesQuery = 'SELECT sfid, Name, Date__c, Amount__c, Place__c,'+ 
                          'Remarks__c, Tour_Bill_Claim__c, Activity_Code__c, Project_Tasks__c '+
                          'FROM salesforce.Conveyance_Charges__c WHERE Tour_Bill_Claim__c = $1';
    await
    pool
    .query(conveyanceChargesQuery,[tourBillClaimId])
    .then((conveyanceChargesQueryResult) => {
        console.log('conveyanceChargesQueryResult.rows '+JSON.stringify(conveyanceChargesQueryResult.rows));

        if(conveyanceChargesQueryResult.rowCount > 0)
        {
            objTourbillClaimRelatedData.conveyanceCharges = conveyanceChargesQueryResult.rows;
        }
    })
    .catch((conveyanceChargesQueryError) => {
        console.log('conveyanceChargesQueryError '+conveyanceChargesQueryError.stack);
    })


    var boardingLodgingChargesQuery = 'SELECT sfid, Name, Tour_Bill_Claim__c, Stay_Option__c, Place_Journey__c,'+ 
                          'Correspondence_City__c, Activity_Code__c, Own_Stay_Amount__c, Project_Tasks__c , From__c, To__c,'+
                          'No_of_Days__c, Total_time__c, Actual_Amount_for_boarding_and_lodging__c, Amount_for_boarding_and_lodging__c,'+
                          'Total_Amount__c, Extra_Amount__c, Total_Allowance__c '+
                          'FROM salesforce.Boarding_Lodging__c WHERE Tour_Bill_Claim__c = $1';
    await
    pool
    .query(boardingLodgingChargesQuery,[tourBillClaimId])
    .then((boardingLodgingChargesQueryResult) => {
        console.log('boardingLodgingChargesQueryResult.rows '+JSON.stringify(boardingLodgingChargesQueryResult.rows));
        if(boardingLodgingChargesQueryResult.rowCount > 0)
        {
            objTourbillClaimRelatedData.boardingLodgingCharges = boardingLodgingChargesQueryResult.rows;
        }
    })
    .catch((boardingLodgingChargesQueryError) => {
        console.log('boardingLodgingChargesQueryError '+boardingLodgingChargesQueryError.stack);
    })


    var telephoneFoodQuery = 'SELECT sfid, Name, Laundry_Expense__c, Fooding_Expense__c, Remarks__c,'+ 
                          'Tour_Bill_Claim__c, Activity_Code__c, Project_Tasks__c, Total_Amount__c '+
                          'FROM salesforce.Telephone_Fooding_Laundry_Expenses__c WHERE Tour_Bill_Claim__c = $1';
    await
    pool
    .query(telephoneFoodQuery,[tourBillClaimId])
    .then((telephoneFoodQueryResult) => {
        console.log('telephoneFoodQueryResult.rows '+JSON.stringify(telephoneFoodQueryResult.rows));
        if(telephoneFoodQueryResult.rowCount > 0)
        {
            objTourbillClaimRelatedData.telephoneFoodCharges = telephoneFoodQueryResult.rows;
        }
    })
    .catch((telephoneFoodQueryError) => {
        console.log('telephoneFoodQueryError '+telephoneFoodQueryError.stack);
    })


    var miscellenousChargesQuery = 'SELECT sfid, Name, Date__c, Amount__c, Particulars_Mode__c,'+ 
    'Remarks__c, Activity_Code__c, Tour_Bill_Claim__c, Project_Tasks__c '+
    'FROM salesforce.Miscellaneous_Expenses__c WHERE Tour_Bill_Claim__c = $1';
    await
    pool
    .query(miscellenousChargesQuery,[tourBillClaimId])
    .then((miscellenousChargesQueryResult) => {
        console.log('miscellenousChargesQueryResult.rows '+JSON.stringify(miscellenousChargesQueryResult.rows));
        if(miscellenousChargesQueryResult.rowCount > 0)
        {
            objTourbillClaimRelatedData.miscellenousCharges = miscellenousChargesQueryResult.rows;
        }
    })
    .catch((miscellenousChargesQueryError) => {
    console.log('miscellenousChargesQueryError '+miscellenousChargesQueryError.stack);
    })
    

    console.log('objTourbillClaimRelatedData   '+JSON.stringify(objTourbillClaimRelatedData));
    response.send(objTourbillClaimRelatedData);

});

/************************************* Start Air Rail Bus ******************************************************************* */

router.get('/airRailBusCharges/:parentTourBillId',verify, (request, response) => {

    let parentTourBillId = request.params.parentTourBillId;
    console.log('airRailBusCharges  parentTourBillId  : '+request.params.parentTourBillId);

    var airRailBusQuery = 'SELECT sfid, Name, Departure_Date__c, Arrival_Date__c, Departure_Station__c,'+ 
                          'Arrival_Station__c, Amount__c, Tour_Bill_Claim__c, Activity_Code__c, Project_Tasks__c '+
                          'FROM salesforce.Air_Rail_Bus_Fare__c WHERE Tour_Bill_Claim__c = $1';
    pool
    .query(airRailBusQuery,[parentTourBillId])
    .then((airRailBusQueryResult) => {
        console.log('airRailBusQueryResult.rows '+JSON.stringify(airRailBusQueryResult.rows));
    })
    .catch((airRailBusQueryError) => {
        console.log('airRailBusQueryError '+airRailBusQueryError.stack);
    })

    response.render('airRailBusCharges',{name:request.user.name, email:request.user.email, parentTourBillId : parentTourBillId});
});


router.post('/airRailBusCharges',verify, (request, response) => {

    var bodyResult = request.body;
    console.log('airRailBusCharges Body'+JSON.stringify(bodyResult));

    let numberOfRows; let lstAirRailBus= [];
    if(typeof(bodyResult.arrival_Date) == 'object')
    {
        numberOfRows = bodyResult.arrival_Date.length;
        for(let i=0; i<numberOfRows ;i++)
        {
                let airRailBusSingleRecordValues = [];
                airRailBusSingleRecordValues.push(bodyResult.arrival_Date[i]);
                airRailBusSingleRecordValues.push(bodyResult.departure_Date[i]);
                airRailBusSingleRecordValues.push(bodyResult.activity_code[i]);
                airRailBusSingleRecordValues.push(bodyResult.arrival_Station[i]);
                airRailBusSingleRecordValues.push(bodyResult.departure_Station[i]);
                airRailBusSingleRecordValues.push(bodyResult.amount[i]);
                airRailBusSingleRecordValues.push(bodyResult.imgpath[i]);
                airRailBusSingleRecordValues.push(bodyResult.parentTourBillId[i]);
                lstAirRailBus.push(airRailBusSingleRecordValues);
        }
    }
    else
    {
        numberOfRows = 1;
        for(let i=0; i<numberOfRows ;i++)
        {
                let airRailBusSingleRecordValues = [];
                airRailBusSingleRecordValues.push(bodyResult.arrival_Date);
                airRailBusSingleRecordValues.push(bodyResult.departure_Date);
                airRailBusSingleRecordValues.push(bodyResult.activity_code);
                airRailBusSingleRecordValues.push(bodyResult.arrival_Station);
                airRailBusSingleRecordValues.push(bodyResult.departure_Station);
                airRailBusSingleRecordValues.push(bodyResult.amount);
                airRailBusSingleRecordValues.push(bodyResult.imgpath);
                airRailBusSingleRecordValues.push(bodyResult.parentTourBillId);
                lstAirRailBus.push(airRailBusSingleRecordValues);
        }
    }
     

    
    

    console.log('lstAirRailBus Final Result  '+JSON.stringify(lstAirRailBus));
    let airRailBusInsertQuery = format('INSERT INTO salesforce.Air_Rail_Bus_Fare__c (Arrival_Date__c, Departure_Date__c,Activity_Code__c,Arrival_Station__c,Departure_Station__c,Amount__c,heroku_image_url__c,Tour_Bill_Claim__c) VALUES %L returning id', lstAirRailBus);

    pool.query(airRailBusInsertQuery)
    .then((airRailBusQueryResult) => {
            console.log('airRailBusQueryResult  '+JSON.stringify(airRailBusQueryResult.rows));
            response.send('Saved Successfully !');
    })
    .catch((airRailBusQueryError) => {
            console.log('airRailBusQueryError  '+airRailBusQueryError.stack);
            response.send('Error Occured While Saving !');
    })

    
});


/*************************************End Air Rail Bus ******************************************************************* */

/*************************************Start  tourBillConveyanceCharges ******************************************************************* */
router.get('/conveyanceCharges/:parentTourBillId',verify, (request, response) => {

    let parentTourBillId = request.params.parentTourBillId;
    console.log('conveyanceCharges parentTourBillId  : '+request.params.parentTourBillId);

    var conveyanceChargesQuery = 'SELECT sfid, Name, Date__c, Amount__c, Place__c,'+ 
                          'Remarks__c, Tour_Bill_Claim__c, Activity_Code__c, Project_Tasks__c '+
                          'FROM salesforce.Conveyance_Charges__c WHERE Tour_Bill_Claim__c = $1';
    pool
    .query(conveyanceChargesQuery,[parentTourBillId])
    .then((conveyanceChargesQueryResult) => {
        console.log('conveyanceChargesQueryResult.rows '+JSON.stringify(conveyanceChargesQueryResult.rows));
    })
    .catch((conveyanceChargesQueryError) => {
        console.log('conveyanceChargesQueryError '+conveyanceChargesQueryError.stack);
    })

    response.render('tourBillConveyanceCharges',{name:request.user.name, email:request.user.email, parentTourBillId :parentTourBillId});
});

router.post('/conveyanceCharges',verify, (request, response) => {

    let bodyResult =  request.body;
    console.log('conveyanceCharges bodyResult  : '+JSON.stringify(bodyResult));
    console.log('typeof(request.body.date)   : '+typeof(request.body.date));

    let numberOfRows ;  let lstConveyanceCharges = [];
    if(typeof(request.body.date) == 'object')
    {
        numberOfRows = request.body.date.length;
        console.log('numberOfRows  '+numberOfRows);
       
        for(let i=0; i < numberOfRows ;i++)
        {
                let singleConveyanceRecord = [];
                singleConveyanceRecord.push(bodyResult.date[i]);
                console.log('index : '+i+'  bodyResult.date[i]  '+bodyResult.date[i]);
                singleConveyanceRecord.push(bodyResult.place[i]);
                console.log('index : '+i+'  bodyResult.place[i]  '+bodyResult.place[i]);
                singleConveyanceRecord.push(bodyResult.activity_code[i]);
                console.log('index : '+i+'  bodyResult.activity_code[i] '+bodyResult.activity_code[i]);
                singleConveyanceRecord.push(bodyResult.remarks[i]);
                console.log('index : '+i+'  bodyResult.remarks[i]  '+bodyResult.remarks[i]);
                singleConveyanceRecord.push(bodyResult.amount[i]);
                console.log('index : '+i+'  bodyResult.amount[i] '+bodyResult.amount[i]);
                singleConveyanceRecord.push(bodyResult.imgpath[i]);
                console.log('index : '+i+'  bodyResult.imgpath[i]  '+bodyResult.imgpath[i]);
                singleConveyanceRecord.push(bodyResult.parentTourBillId[i]);
                console.log('index : '+i+'  bodyResult.parentTourBillId[i]  '+bodyResult.parentTourBillId[i]);
                lstConveyanceCharges.push(singleConveyanceRecord);
        }
        console.log('lstConveyanceCharges  : '+JSON.stringify(lstConveyanceCharges));
    }  
    else
    {
        numberOfRows = 1;
        for(let i=0; i < numberOfRows ;i++)
        {
                let singleConveyanceRecord = [];
                singleConveyanceRecord.push(bodyResult.date);
                singleConveyanceRecord.push(bodyResult.place);
                singleConveyanceRecord.push(bodyResult.activity_code);
                singleConveyanceRecord.push(bodyResult.remarks);
                singleConveyanceRecord.push(bodyResult.amount);
                singleConveyanceRecord.push(bodyResult.imgpath);
                singleConveyanceRecord.push(bodyResult.parentTourBillId);
                lstConveyanceCharges.push(singleConveyanceRecord);
        }
        console.log('lstConveyanceCharges  : '+JSON.stringify(lstConveyanceCharges));
    }
        
    let conveyanceChargesInsertQuery = format('INSERT INTO salesforce.Conveyance_Charges__c  (Date__c, Place__c, Activity_Code__c,Remarks__c,Amount__c,Heroku_Image_URL__c,Tour_Bill_Claim__c) VALUES %L returning id',lstConveyanceCharges);
    pool.query(conveyanceChargesInsertQuery)
    .then((conveyanceChargesQueryResult) => {
        console.log('conveyanceChargesQueryResult  '+conveyanceChargesQueryResult.rows);
        response.send('Saved Successfully !');    
    })
    .catch((conveyanceChargesQueryError) => {
        console.log('conveyanceChargesQueryError   '+conveyanceChargesQueryError.stack);
        response.send('Error Occured !');
    });
    
});

/************************************* end tourBillConveyanceCharges ******************************************************************* */


/************************************* Start boardingLodgingCharges ******************************************************************* */

router.get('/boardingLodgingCharges/:parentTourBillId', verify, (request, response) => {

    let parentTourBillId = request.params.parentTourBillId;
    console.log(' boardingLodgingCharges parentTourBillId  : '+request.params.parentTourBillId);

    var boardingLodgingChargesQuery = 'SELECT sfid, Name, Tour_Bill_Claim__c, Stay_Option__c, Place_Journey__c,'+ 
                          'Correspondence_City__c, Activity_Code__c, Own_Stay_Amount__c, Project_Tasks__c , From__c, To__c,'+
                          'No_of_Days__c, Total_time__c, Actual_Amount_for_boarding_and_lodging__c, Amount_for_boarding_and_lodging__c,'+
                          'Total_Amount__c, Extra_Amount__c, Total_Allowance__c '+
                          'FROM salesforce.Boarding_Lodging__c WHERE Tour_Bill_Claim__c = $1';
    pool
    .query(boardingLodgingChargesQuery,[parentTourBillId])
    .then((boardingLodgingChargesQueryResult) => {
        console.log('boardingLodgingChargesQueryResult.rows '+JSON.stringify(boardingLodgingChargesQueryResult.rows));
    })
    .catch((boardingLodgingChargesQueryError) => {
        console.log('boardingLodgingChargesQueryError '+boardingLodgingChargesQueryError.stack);
    })

    response.render('boardingLodgingCharges',{name:request.user.name, email:request.user.email, parentTourBillId :parentTourBillId});
});

router.post('/boardingLodgingCharges',verify, (request, response) => {

    

    response.send();
});

/*************************************End  boardingLodgingCharges******************************************************************* */

/************************************* start telephoneFoodCharges ******************************************************************* */
router.get('/telephoneFood/:parentTourBillId',verify, (request, response) => {

    let parentTourBillId = request.params.parentTourBillId;
    console.log('telephoneFood  parentTourBillId  : '+request.params.parentTourBillId);

    var telephoneFoodQuery = 'SELECT sfid, Name, Laundry_Expense__c, Fooding_Expense__c, Remarks__c,'+ 
                          'Tour_Bill_Claim__c, Activity_Code__c, Project_Tasks__c, Total_Amount__c '+
                          'FROM salesforce.Telephone_Fooding_Laundry_Expenses__c WHERE Tour_Bill_Claim__c = $1';
    pool
    .query(telephoneFoodQuery,[parentTourBillId])
    .then((telephoneFoodQueryResult) => {
        console.log('telephoneFoodQueryResult.rows '+JSON.stringify(telephoneFoodQueryResult.rows));
    })
    .catch((telephoneFoodQueryError) => {
        console.log('telephoneFoodQueryError '+telephoneFoodQueryError.stack);
    })

    response.render('telephoneFoodCharges',{name:request.user.name, email:request.user.email, parentTourBillId : parentTourBillId});
});

router.post('/telephoneFood',verify, (request, response) => {

    console.log('request.body  :  '+JSON.stringify(request.body));

    let numberOfRows, lstTelephoneFood = [];
    if(typeof(request.body.foodingExpenses) != 'object')
    {
        numberOfRows = 1;
        let singleTelephoneFoodRecord = [];
        singleTelephoneFoodRecord.push(request.body.foodingExpenses);
        singleTelephoneFoodRecord.push(request.body.laundryExpenses);
        singleTelephoneFoodRecord.push(request.body.activity_code);
        singleTelephoneFoodRecord.push(request.body.remarks);
        singleTelephoneFoodRecord.push(request.body.imgpath);
        singleTelephoneFoodRecord.push(request.body.parentTourBillId);
        lstTelephoneFood.push(singleTelephoneFoodRecord);
    }
    else
    {
        numberOfRows = request.body.foodingExpenses.length;
        for(let i=0; i< numberOfRows ; i++)
        {
            let singleTelephoneFoodRecord = [];
            singleTelephoneFoodRecord.push(request.body.foodingExpenses[i]);
            singleTelephoneFoodRecord.push(request.body.laundryExpenses[i]);
            singleTelephoneFoodRecord.push(request.body.activity_code[i]);
            singleTelephoneFoodRecord.push(request.body.remarks[i]);
            singleTelephoneFoodRecord.push(request.body.imgpath[i]);
            singleTelephoneFoodRecord.push(request.body.parentTourBillId[i]);
            lstTelephoneFood.push(singleTelephoneFoodRecord);
        }
    }
    console.log('lstTelephoneFood  '+JSON.stringify(lstTelephoneFood));
    let telephoneFoodInsertQuery = format('INSERT INTO salesforce.Telephone_Fooding_Laundry_Expenses__c (Fooding_Expense__c, Laundry_Expense__c, Activity_Code__c,Remarks__c,heroku_image_url__c, Tour_Bill_Claim__c) VALUES %L returning id',lstTelephoneFood);

    pool.query(telephoneFoodInsertQuery)
    .then((telephoneFoodInsertQueryResult) => {
        console.log('telephoneFoodInsertQueryResult  '+JSON.stringify(telephoneFoodInsertQueryResult.rows));
        response.send('Saved Successfully !');
    })
    .catch((telephoneFoodInsertQueryError) => {
        console.log('telephoneFoodInsertQueryError  '+telephoneFoodInsertQueryError.stack);
        response.send('Error Occured !');
    })

  
});

/************************************* End telephoneFoodCharges ******************************************************************* */


/************************************* Start Miscellaneous Charges ******************************************************************* */
router.get('/miscellenousCharges/:parentTourBillId', verify, (request, response) => {

    let parentTourBillId = request.params.parentTourBillId;
    console.log('miscellenousCharges  parentTourBillId  : '+request.params.parentTourBillId);

    var miscellenousChargesQuery = 'SELECT sfid, Name, Date__c, Amount__c, Particulars_Mode__c,'+ 
                                    'Remarks__c, Activity_Code__c, Tour_Bill_Claim__c, Project_Tasks__c '+
                                    'FROM salesforce.Miscellaneous_Expenses__c WHERE Tour_Bill_Claim__c = $1';

    pool
    .query(miscellenousChargesQuery,[parentTourBillId])
    .then((miscellenousChargesQueryResult) => {
    console.log('miscellenousChargesQueryResult.rows '+JSON.stringify(miscellenousChargesQueryResult.rows));
    })
    .catch((miscellenousChargesQueryError) => {
    console.log('miscellenousChargesQueryError '+miscellenousChargesQueryError.stack);
    })

    response.render('miscellenousCharges',{name:request.user.name, email:request.user.email, parentTourBillId : parentTourBillId});
});

router.post('/miscellenousCharges',verify, (request, response) => {

    console.log('miscellaneous Expenses Body '+JSON.stringify(request.body));

    let numberOfRows, lstMiscellaneousCharges = [];
    if(typeof(request.body.date) != 'object')
    {
        console.log('Single Row');
        let singleMicellaneousChargeRecord = [];
        singleMicellaneousChargeRecord.push(request.body.date);
        singleMicellaneousChargeRecord.push(request.body.particulars_mode);
        singleMicellaneousChargeRecord.push(request.body.activity_code);
        singleMicellaneousChargeRecord.push(request.body.remarks);
        singleMicellaneousChargeRecord.push(request.body.amount);
        singleMicellaneousChargeRecord.push(request.body.imgpath);
        singleMicellaneousChargeRecord.push(request.body.parentTourBillId);
        lstMiscellaneousCharges.push(singleMicellaneousChargeRecord);
    }
    else
    {
        numberOfRows = request.body.date.length;
        console.log('Multiple Rows '+'  numberOfRows '+numberOfRows);

        for(let i=0;i < numberOfRows ; i++)
        {
            let singleMicellaneousChargeRecord = [];
            singleMicellaneousChargeRecord.push(request.body.date[i]);
            singleMicellaneousChargeRecord.push(request.body.particulars_mode[i]);
            singleMicellaneousChargeRecord.push(request.body.activity_code[i]);
            singleMicellaneousChargeRecord.push(request.body.remarks[i]);
            singleMicellaneousChargeRecord.push(request.body.amount[i]);
            singleMicellaneousChargeRecord.push(request.body.imgpath[i]);
            singleMicellaneousChargeRecord.push(request.body.parentTourBillId[i]);
            lstMiscellaneousCharges.push(singleMicellaneousChargeRecord[i]);
        }
    }

    let miscellenousChargesInsertQuery = format('INSERT INTO salesforce.Miscellaneous_Expenses__c (Date__c,Particulars_Mode__c,Activity_Code__c,Remarks__c,Amount__c, Heroku_Image_URL__c, Tour_Bill_Claim__c) VALUES %L returning id', lstMiscellaneousCharges);

    pool.query(miscellenousChargesInsertQuery)
    .then((miscellenousChargesInsertQueryResult) => {
        console.log('miscellenousChargesInsertQueryResult  '+JSON.stringify(miscellenousChargesInsertQueryResult.rows));
        response.send('Saved Succesfully');
    })
    .catch((miscellenousChargesInsertQueryError) => {
        console.log('miscellenousChargesInsertQueryError  '+miscellenousChargesInsertQueryError.stack);
        response.send('Error Occurred !');
    })
    
});

/************************************* End Miscellaneous Charges ******************************************************************* */


router.get('/gettourBillClaimDetail',verify,(request, response) => {

    let  tourbillId= request.query.tourbillId;
    console.log('tourbillId  : '+tourbillId);
    let queryText = 'SELECT tourBill.sfid, tourBill.grand__c, tourBill.name as tourbillname ,exp.name as expname,tourBill.createddate '+
                     'FROM salesforce.Tour_Bill_Claim__c tourBill '+ 
                     'INNER JOIN salesforce.Milestone1_Expense__c exp '+
                     'ON tourBill.Expense__c =  exp.sfid '+
                     'WHERE  tourBill.sfid= $1 ';
  
    pool
    .query(queryText,[tourbillId])
    .then((tourBillClaimResult) => {
          console.log('tourBillClaimResult  '+JSON.stringify(tourBillClaimResult.rows));
          if(tourBillClaimResult.rowCount > 0)
          {
            response.send(tourBillClaimResult.rows);
          }
          else
          {
            response.send({});
          }
           
    })
    .catch((tourBillClaimQueryError) => {
          console.log('tourBillClaimQueryError  '+tourBillClaimQueryError.stack);
          response.send({});
    })
  
  })






module.exports = router;