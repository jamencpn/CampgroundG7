const Hospital = require('../models/Hospital.js');


//@desc     Get all hospitals
//@route    GET /api/v1/hospitals
//@access   Public
exports.getHospitals=async (req,res,next)=>{

        let query;

        //Copy req.query
        const reqQuery={...req.query};

        //Fields to exclude
        const removeFields=['select','sort','page','limit'];

        //Loop over remove fields and delete them from reqQuery
        removeFields.forEach(param=>delete reqQuery[param]);
        console.log(reqQuery);

        //Create query string
        let queryStr=JSON.stringify(reqQuery);
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);
    
        query=Hospital.find(JSON.parse(queryStr)).populate('appointments');
        
        //Select Fields
        if(req.query.select){
            const fields=req.query.select.split(',').join(' ');
            query=query.select(fields);
        }

        //Sort
        if(req.query.sort){
            const SortBy=req.query.sort.split(',').join(' ');
            query=query.sort(SortBy);
        } else{
            query=query.sort('-createdAt');
        }

        //Pagination
        const page=parseInt(req.query.page,10)|| 1;
        const limit=parseInt(req.query.limit,10)||25;
        const startIndex=(page-1)*limit;
        const endIndex=page*limit;
        const total=await Hospital.countDocuments();

        query=query.skip(startIndex).limit(limit);
    try{
        //Executing query
        const hospitals = await query;
        //Pagination result
        const pagination = {};

        if (endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }
        console.log(req.query);
    res.status(200).json({success:true, count:hospitals.length, data:hospitals});
    } catch(err){
        res.status(400).json({success:false});
    }
};

//@desc     Get single hospital
//@route    GET /api/v1/hospitals/:id
//@access   Public
exports.getHospital=async (req,res,next)=>{
    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            return res.status(400).json({success:false});
        }
    res.status(200).json({success:true, data:hospital});
    } catch(err){
        res.status(400).json({success:false});
    }
};

//@desc     Create new hospitals
//@route    POST /api/v1/hospitals
//@access   Private
exports.createHospital=async (req,res,next)=>{
    const hospital = await Hospital.create(req.body);
    res.status(201).json({
        success:true, 
        data:hospital});
};

//@desc     Update hospital
//@route    PUT /api/v1/hospitals/:id
//@access   Private
exports.updateHospital=async (req,res,next)=>{
    try{
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators:true
        });

        if(!hospital){
            return res.status(400).json({success:false});
        }
    res.status(200).json({success:true, data:hospital});
    } catch(err){
        res.status(400).json({success:false});
    }
};

//@desc     Delete hospitals
//@route    DELETE /api/v1/hospitals/:id
//@access   Private
exports.deleteHospital=async (req,res,next)=>{
    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            return res.status(400).json({success:false});
        }
    
    hospital.remove();
    res.status(200).json({success:true, data: {}});
    } catch(err){
        res.status(400).json({success:false});
    }
};
