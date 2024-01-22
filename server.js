var express = require("express");
var mysql = require("mysql");
var fileuploader = require("express-fileupload");
var path = require("path");
var nodemailer = require('nodemailer');

var app = express();

app.use(express.urlencoded("true"));
app.use(fileuploader());

app.listen(2003, function () {
    console.log("Server Started");
});

app.use(express.static("public"));

//========for databas configuration=========
var dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "project",
    dateStrings: true
}

//========for Databse Refer===================
var dbRef = mysql.createConnection(dbConfig);
dbRef.connect(function (err) {
    if (err == null)
        console.log("Connected Successfully");
    else
        console.log(err);
});

app.get("/", function (req, resp) {
    var folder = process.cwd();
    var file = __filename;
    var fullpath = folder + "/public/index.html";
    resp.sendFile(fullpath);
});

//======================================================================================================================================//

//================Login Code============================================
app.get("/login", function (req, resp) {
    console.log(req.query);
    dbRef.query("Select * from users where email=? and password=?", [req.query.kuchemail, req.query.kuchpwd], function (err, TableJsonAry) {
        if (err)
            resp.send(err);
        else if (TableJsonAry.length == 1) {
            if (TableJsonAry[0].status == 1) {
                // resp.send(TableJsonAry[0].utype);
                if (TableJsonAry[0].utype == 'Donor') {
                    resp.send("Donor");
                } else if (TableJsonAry[0].utype == 'Receiver') {
                    resp.send("Receiver");
                }

            } else if (TableJsonAry[0].status == 0) {
                resp.send("User Blocked");
            }
        }
        else {
            resp.send("Invalid Email or Password");
        }
    })
})

//=======================================================================================================================================//

//=======================sign up Code================================
app.get("/signup", function (req, resp) {
    console.log(req.query);
    var mailer = req.query.kuchemail;
    var data = [req.query.kuchemail, req.query.kuchpwd, req.query.utype];

    // var email = req.query.kuchemail;
    // var pwd = req.query.kuchpwd;
    // var type = req.query.utype;
    // var dos="";

    dbRef.query("insert into users values(?,?,?,current_date(),1)", data, function (err, TableJsonAry) {
        if (err)
            console.log(err);
        else if (TableJsonAry.length == 1) {
            resp.send("Invalid Email");
        }
        else {
            resp.send("valid");

            // if (req.query.utype == 'Donor') {
            //     resp.send("Donor");
            // } else if (req.query.utype  == 'Receiver') {
            //     resp.send("Receiver");
            // }


            var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "gargaashim123@gmail.com",
                    pass: "rrhdwesnhzwjiwbz"
                }
            });
            var mailoption = {
                from: "gargaashim123@gmail.com",
                to: mailer,
                subject: "Sign Up Successfull",
                text: "Sign Up Successfull.......",
            };
            transporter.sendMail(mailoption, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Email Sent......");
                }
            });
        }
    })
})

//=========================================================================================================================================//

//==============For Donor Profile=================
app.get("/", function (req, resp) {
    var folder = process.cwd();
    var file = __filename;
    var fullpath = folder + "/public/donor_profile.html";
    resp.sendFile(fullpath);
});

app.post("/savedata", function (req, resp) {
    console.log(req.body);
    //========== Getting Data From Form =============
    var email = req.body.email;
    var mobile = req.body.mobile;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var gender = req.body.gender;
    var dob = req.body.dob;
    var city = req.body.city;
    var state = req.body.state;
    var zip = req.body.zip;
    var adr1 = req.body.adr1;
    var adr2 = req.body.adr2;
    var idprf = req.body.idprf;
    var idno = req.body.idno;

    //=========moving idpic=============
    var picname = "NOT UPLOADED";
    if (req.files != null) {
        picname = req.files.ppic.name;
        console.log("File Name=" + picname);

        // var path = process.cwd()+"/public/uploads/" + picname;
        // req.files.ppic.mv(path,function(err){
        //     if (err)
        //     {
        //         console.log(err);
        //     }else 
        //     {
        //         console.log("Moved Success");
        //     }
        // });//saving in uploads folder


        var des = path.join(__dirname, "public", "uploads", picname);
        req.files.ppic.mv(des, function (err) {
            if (err)
                console.log(err);
            else
                console.log("Upload Successful");
        })

    }
    //=========sending data to server==========
    var data = [email, mobile, fname, lname, gender, dob, city, state, zip, adr1, adr2, idprf, idno, picname];
    dbRef.query("insert into dprofile values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", data, function (err) {
        if (err) {
            console.log(err);
            resp.send(err);
        }
        else {
            // alert("Done");
            resp.send("Done......");
        }
    });
})

//=================To Update Record==================
app.post("/updatedata", function (req, resp) {
    console.log(req.body);
    //==========Getting Data From Form=============
    var email = req.body.email;
    var mobile = req.body.mobile;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var gender = req.body.gender;
    var dob = req.body.dob;
    var city = req.body.city;
    var state = req.body.state;
    var zip = req.body.zip;
    var adr1 = req.body.adr1;
    var adr2 = req.body.adr2;
    var idprf = req.body.idprf;
    var idno = req.body.idno;

    if (req.files != null) {
        picname = req.files.ppic.name;
        console.log("File Name= " + picname);

        var path = process.cwd() + "/public/uploads/" + picname;
        req.files.ppic.mv(path, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Moved Success");
            }
        });//saving in uploads folder

    } else
        picname = req.body.nhdn;
    var data = [mobile, fname, lname, gender, dob, city, state, zip, adr1, adr2, idprf, idno, picname, email];
    dbRef.query("update dprofile set mobile=?,fname=?,lname=?,gender=?,dob=?,city=?,state=?,zip=?,address1=?,address2=?,idproof=?,idno=?,pp=? where email=?", data, function (err, result) {
        if (err != null)
            resp.send(err);
        else if (result.affectedRows == 1)
            resp.send("Record Updated Successfullyyyy");
        else
            resp.send("Invalid ID");
    });
});
//================For Search Button Donor===============
app.get("/search", function (req, resp) {
    dbRef.query("Select * from dprofile where email=?", [req.query.getemail], function (err, TableJsonAry) {
        if (err)
            resp.send(err);
        else
            resp.send(TableJsonAry);
    })

})

//=========================================================================================================================================//


//===================To Save Meds=========================
app.get("/", function (req, resp) {
    var folder = process.cwd();
    var file = __filename;
    var fullpath = folder + "/public/med.html";
    resp.sendFile(fullapth);
})

app.post("/savemeds", function (req, resp) {
    console.log(req.body);
    var email = req.body.email;
    var mname = req.body.mname;
    var comp = req.body.comp;
    var salt = req.body.salt;
    var exp = req.body.exp;
    var packing = req.body.packing;
    var qty = req.body.qty;
    var picname = "NOT UPLOADED";
    if (req.files != null) {
        picname = req.files.mpic.name;
        console.log("File Name=" + picname);
        var path = process.cwd() + "/public/medpics/" + picname;
        req.files.mpic.mv(path, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Moved Success");
            }
        });//saving in uploads folder
    }
    var data = [, email, mname, comp, salt, exp, qty, packing, picname];
    dbRef.query("insert into medicines values(?,?,?,?,?,?,?,?,?)", data, function (err) {
        if (err) {
            console.log(err);
            resp.send(err);
        }
        else {
            resp.send("Done......");
        }
    });

})

//=======================================================================================================================================//

//=========For Donor Dashboard==================
app.get("/", function (req, resp) {
    var folder = process.cwd();
    var file = __filename;
    var fullpath = folder + "/public/donor_page.html";
    resp.sendFile(fullpath);
});

app.get("/chkpwd", function (req, resp) {
    console.log(req.query);
    var pwd = req.query.kuchpwd;
    var email = req.query.kuchemail;
    dbRef.query("Select password from users where email=?", [email], function (err, TableJsonAry) {
        if (err) {
            resp.send(err);
        } else if (TableJsonAry[0].password != pwd) {
            resp.send("Invalid");
        } else {
            resp.send("Valid");
        }
    });
})

app.get("/updatepwd", function (req, resp) {
    console.log(req.query);
    var email = req.query.email;
    var npwd = req.query.npwd;
    dbRef.query("update users set password=? where email=?", [npwd, email], function (err) {
        if (err)
            resp.send(err);
        else
            resp.send("Updated...");
    })

})
//=============For Admin Dashboard=====================
app.get("/", function (req, resp) {
    var folder = process.cwd();
    var file = __filename;
    var fullpath = folder + "/public/admin_dash.html";
    resp.sendFile(fullpath);
})

//==============For Admin User Management=========================
app.get("/showdata", function (req, resp) {
    dbRef.query("Select * from users", function (err, TableJsonAry) {
        if (err)
            resp.send(err);
        else {
            console.log(TableJsonAry);
            resp.send(TableJsonAry);
        }
    })
})

//================To change status=================
app.get("/block", function (req, resp) {
    var data = [req.query.email];
    dbRef.query("Update users set status = 0 where email=?", data, function (err, TableJsonAry) {
        if (err) {
            resp.send(err);
        }
        else {
            resp.send(TableJsonAry);
        }
    })
});
app.get("/unblock", function (req, resp) {
    var data = [req.query.email];
    dbRef.query("Update users set status = 1 where email=?", data, function (err, TableJsonAry) {
        if (err) {
            resp.send(err);
        }
        else {
            resp.send(TableJsonAry);
        }
    })
});

//=============================================================================================================================================//

//================For Donor Admin Panel=======================
app.get("/showdnr", function (req, resp) {
    dbRef.query("Select * from dprofile", function (err, TableJsonAry) {
        if (err)
            resp.send(err);
        else {
            console.log(TableJsonAry);
            resp.send(TableJsonAry);
        }
    })
})

app.get("/deletednr", function (req, resp) {
    var data = [req.query.email];
    dbRef.query("delete from dprofile where email=?", data, function (err, TableJsonAry) {
        if (err) {
            resp.send(err);
        }
        else {
            resp.send(TableJsonAry);
        }
    })
});

//===================================================================================================================================//

//================For Receiver Admin Panel=======================
app.get("/showrec", function (req, resp) {
    dbRef.query("Select * from rprofile", function (err, TableJsonAry) {
        if (err)
            resp.send(err);
        else {
            console.log(TableJsonAry);
            resp.send(TableJsonAry);
        }
    })
})

app.get("/deleterec", function (req, resp) {
    var data = [req.query.email];
    dbRef.query("delete from rprofile where email=?", data, function (err, TableJsonAry) {
        if (err) {
            resp.send(err);
        }
        else {
            resp.send(TableJsonAry);
        }
    })
});

//===================================================================================================================================//

//===============For Receiver Dashboard==============================
app.get("/", function (req, resp) {
    var folder = process.cwd();
    var file = __filename;
    var fullpath = folder + "/public/receiver_page.html";
    resp.sendFile(fullpath);
});

app.post("/savedatar", function (req, resp) {
    console.log(req.body);

    //==========Getting Data From Form=============
    var email = req.body.email;
    var mobile = req.body.mobile;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var gender = req.body.gender;
    var adr = req.body.adr;
    var dis = req.body.dis;
    var idprf = req.body.idprf;
    var idno = req.body.idno;

    //=========moving idpic=============
    var picname = "NOT UPLOADED";
    if (req.files != null) {
        picname = req.files.ppic.name;
        console.log("File Name=" + picname);

        var des = path.join(__dirname, "public", "ruploads", picname);
        req.files.ppic.mv(des, function (err) {
            if (err)
                console.log(err);
            else
                console.log("Upload Successful");
        })

    }

    //=========sending data to server==========
    var data = [email, fname, lname, mobile, gender, adr, dis, idprf, idno, picname];
    dbRef.query("insert into rprofile values(?,?,?,?,?,?,?,?,?,?)", data, function (err) {
        if (err) {
            console.log(err);
            resp.send(err);
        }
        else {
            resp.send("Done......");
        }
    });
})

//=================To Update Record==================
app.post("/updatedatar", function (req, resp) {
    console.log(req.body);
    //==========Getting Data From Form=============
    var email = req.body.email;
    var mobile = req.body.mobile;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var gender = req.body.gender;
    var adr = req.body.adr;
    var dis = req.body.dis;
    var idprf = req.body.idprf;
    var idno = req.body.idno;

    if (req.files != null) {
        picname = req.files.ppic.name;
        console.log("File Name= " + picname);

        var path = process.cwd() + "/public/ruploads/" + picname;
        req.files.ppic.mv(path, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Moved Success");
            }
        });//saving in uploads folder
    }
    else
        picname = req.body.nhdn;
    var data = [mobile, fname, lname, gender, adr, dis, idprf, idno, picname, email];

    dbRef.query("update rprofile set mobile=?,fname=?,lname=?,gender=?,address=?,disease=?,idproof=?,idno=?,pp=? where email=?", data, function (err, result) {
        if (err != null)
            resp.send(err);
        else if (result.affectedRows == 1)
            resp.send("Record Updated Successfullyyyy");
        else
            resp.send("Invalid ID");
    });
});
//================For Search Button Donor===============
app.get("/searchr", function (req, resp) {
    dbRef.query("Select * from rprofile where email=?", [req.query.getemail], function (err, TableJsonAry) {
        if (err)
            resp.send(err);
        else
            resp.send(TableJsonAry);
    })

})

//===========================================================================================================================================//

//===================================For Search Medicine===============================//

//============== To Fetch Cities From Donor Table =============//

app.get("/fetch-all-cities", function (req, resp) {
    dbRef.query("select distinct city from dprofile", function (err, TableJsonAry) {
        if (err)
            resp.send(err);
        else {
            resp.send(TableJsonAry);
        }

    })
})

//============== To Fetch Meds From Medicine Table =============//

app.get("/fetch-all-meds", function (req, resp) {
    dbRef.query("select distinct medname from medicines", function (err, TableJsonAry) {
        if (err)
            resp.send(err);

        else {
            resp.send(TableJsonAry);
            console.log(TableJsonAry);
        }

    })
})

//=============== To Fetch Data From Table Based On Email =================//

// app.get("/fetch-all-donors", function (req, resp) {
//     dbRef.query("select * from dprofile where city=?", [req.query.city], function (err, TableJsonAry) {
//         if (err)
//             resp.send(err);
//         else {
//             resp.send(TableJsonAry);
//         }

//     });
// });


app.get("/fetch-all-donors", function (req, resp) {
    dbRef.query("SELECT * FROM medicines INNER JOIN dprofile ON medicines.email = dprofile.email where city =? and medname=?", [req.query.city, req.query.medname], function (err, TableJsonAry) {
        if (err)
            resp.send(err);
        else {
            resp.send(TableJsonAry);
        }

    });
});