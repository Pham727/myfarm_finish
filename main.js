var express = require('express');
var nodemailer = require('nodemailer');
var app =express();
app.set('view engine','ejs');
var publicDir = require('path').join(__dirname,'/public'); 
app.use(express.static(publicDir));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
//Su dung Session
var session = require('express-session');
app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: '1234567abc', 
    cookie: { maxAge: 60000 }}));
const { Console } = require('console');
const { render } = require('ejs');
//var user=require('./controllers/usercontroller');

const fileupload = require("express-fileupload");
app.use(fileupload());

var danhmuc=require('./controllers/loaispcontroller');
var sanpham=require('./controllers/productcontroller')
var User=require('./controllers/usercontroller')
var donhang=require('./controllers/donhangcontroller');
const internal = require('stream');
app.get('/',function(req,res){
  HienThi(req,res);
});

app.get('/dangnhap', async function(req,res){
    var menu= await danhmuc.selectmenu();
		var taikhoan=dangnhap(req,res);
    var giohang=ThongTinGioHang(req)
    res.render('login',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu});
});

app.get('/admin',async function(req,res){
  var menu= await danhmuc.selectmenu();
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  res.render('adminlogin',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu});
});

app.get('/about',async function(req,res){
  var menu= await danhmuc.selectmenu();
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  res.render('about',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu});
});


app.get('/dangki',function(req,res){
    res.render('registration');
});

app.get('/thanhcong', async function(req, res){
  var menu= await danhmuc.selectmenu();
  var taikhoan=dangnhapadmin(req,res);
  var giohang=ThongTinGioHang(req)
  res.render('success',{dangnhap:taikhoan,ttgiohang:giohang, menuloaisp:menu});

})


app.get('/dangxuat', function(req, res) {
  req.session.user=null;
  req.session.giohang=null;
  res.redirect("/");
});

app.get('/contact',async function(req,res){
  var menu= await danhmuc.selectmenu();
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  res.render('contact',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu});
});


app.get('/checkout',async function(req,res){
  hoten="";
  diachi="";
  dienthoai="";
  email="";
  if (req.session.user!=""&&req.session.user!=undefined){
    hoten=req.session.user.username;
    diachi=req.session.user.address;
    dienthoai=req.session.user.phone;
    email=req.session.user.email;
  }
  var giohang = req.session.giohang;
	var kq="";
  var tongtien=0;
	if (giohang!=undefined){
      for (i=0;i<giohang.length;i++){
        kq=kq+"<p>"+giohang[i].tensanpham+" x <b>"+giohang[i].soluong+"</b><span>"+giohang[i].soluong*giohang[i].giaban+"</span></p>"
        tongtien = tongtien + giohang[i].soluong*giohang[i].giaban;
      }
	}
  /*var ship=0.1*tongtien;
  var tongchiphi=ship+tongtien;*/
  kq=kq+"<p class='sub-total'>Tổng <span>"+tongtien+"đ</span></p>"
    +"<p class='ship-cost'>Phụ phí<span>0đ</span></p>"
    +"<h4>Tổng cộng<span>"+tongtien+"đ</span></h4>"
    var menu= await danhmuc.selectmenu();
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  res.render('checkout',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,donhang:kq,hoten:hoten,diachi:diachi,sodt:dienthoai,email:email});
})
//////////////////////////////////
/// Tài Khoản ///////////////////
/////////////////////////////////
app.get('/taikhoan',async function(req,res){
  hoten="";
  tendn=""
  diachi="";
  dienthoai="";
  email="";
  if (req.session.user!=""&&req.session.user!=undefined){
    hoten=req.session.user.name
    tendn=req.session.user.username;
    diachi=req.session.user.address;
    dienthoai=req.session.user.phone;
    email=req.session.user.email;
  }
  var menu= await danhmuc.selectmenu();
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  res.render('account',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,tendn:tendn,hoten:hoten,diachi:diachi,sodt:dienthoai,email:email});
})

app.get('/ttdonhang', async function(req,res){
  var donhangdadat= await donhang.select(req.session.user.username);
  var menu= await danhmuc.selectmenu();
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  res.render('accountdonhang',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,tendn:tendn,hoten:hoten,diachi:diachi,sodt:dienthoai,email:email,dsdonhang:donhangdadat});
})

app.get('/ttdonhang/:madh', async function(req,res){
  var sodh = req.params.madh;
  var chitetdh= await donhang.selectchitietdonhang(sodh);
  var menu= await danhmuc.selectmenu();
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  res.render('chitietdonhang',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,tendn:tendn,hoten:hoten,diachi:diachi,sodt:dienthoai,email:email,chitietdonhang:chitetdh});
})

//////////////////////////////////
/// END tài Khoản ///////////////
/////////////////////////////////

app.get('/xulydathang/:madh', async function(req,res){
  var sodh = req.params.madh;
  var chitetdh= await donhang.chitietdonhang(sodh);
  var dh= await donhang.donhang(sodh)
  //console.log(dh);
  var menu= await danhmuc.selectmenu();
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  res.render('success',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,chitietdh:chitetdh,donhang:dh});
})


////////////////////////////
// phương thức get cho admin
////////////////////////////



app.get('/admin/loaisp', async function(req,res){
  var taikhoan=dangnhapadmin(req,res);
  var giohang=ThongTinGioHang(req)
  var menu= await danhmuc.selectmenu();
  var loai = await danhmuc.selectforAdmin()
  res.render('quanliloaisp',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,loaisanpham:loai});

})

app.get('/admin/sp', async function(req,res){
  var taikhoan=dangnhapadmin(req,res);
  var giohang=ThongTinGioHang(req)
  var menu= await danhmuc.selectmenu();
  var dssanpham= await sanpham.selectforadmin();
  res.render('quanlisp',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,dssanpham:dssanpham});

})
app.get('/admin/themsp', async function(req, res){
  var taikhoan=dangnhapadmin(req,res);
  var giohang=ThongTinGioHang(req)
  var menu= await danhmuc.selectmenu();
  var cboloai1 = await danhmuc.selectCombobox();
  res.render('themsp',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,cboloai:cboloai1});
})

app.post('/themsp', async function(req,res){
	var thongtin=req.body;
 // console.log(thongtin)
	let sampleFile;
	let uploadPath;
	sampleFile = req.files.hinh_sp;
	tensanpham = thongtin.ten_sp;
	dongia = thongtin.don_gia;
  hinh = sampleFile.name;
	loai = thongtin.loai_sp;
	mota = thongtin.mo_ta;
	var sp = {idProduct: 11,idCat:loai,nameProduct:tensanpham,priceProduct:dongia,imgProduct:hinh,desProduct:mota};
	var kq = await sanpham.insert(sp);
  if (!req.files || Object.keys(req.files).length===0){
		return res.status(400).send('No file were uploaded.');
	}
	uploadPath = __dirname +'/public/img/' + sampleFile.name;
	sampleFile.mv(uploadPath,function(err){
		if (err)
		return res.status(500).send(err);
	  res.redirect('/admin/sp');
})
});



app.get('/admin/themloaisp', async function(req, res){
  var taikhoan=dangnhapadmin(req,res);
  var giohang=ThongTinGioHang(req)
  var menu= await danhmuc.selectmenu();
  res.render('themloaisp',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu});
})

app.post('/themloaisp', async function(req,res){
  var thongtin = req.body;
  var tenloai = thongtin.ten_sp;
  var loai = {idCat:1,nameCat:tenloai};
  var kq = await danhmuc.insert(loai);
  res.redirect('/admin/loaisp')
})

app.get('/capnhaploai/:ma',  async function(req, res){
  var ma = req.params.ma;
  HienThiCapNhapLoai(req,res,ma);
})
async function HienThiCapNhapLoai(req,res,ma){
  var taikhoan=dangnhapadmin(req,res);
  var giohang=ThongTinGioHang(req);
  var menu= await danhmuc.selectmenu();
  var chitietcapnhap = await danhmuc.selectforcapnhap(ma);
  res.render('capnhatloaisp',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,chitiet:chitietcapnhap});
}

app.post('/capnhaploaisp/:ma', async function(req,res){
  var maloai = req.params.ma;
  var tenloai = req.body.ten_loaisp;
  var kq = danhmuc.update(maloai,tenloai);
  res.redirect('/admin/loaisp')
})

app.get('/capnhatsp/:ma', async function(req, res){
  var ma = req.params.ma;
  HienThiCapNhapSanPham(req,res,ma);
  //res.render('capnhatsp',{dangnhap:taikhoan,ttgiohang:giohang});
})
async function HienThiCapNhapSanPham(req,res,ma){
  var taikhoan=dangnhapadmin(req,res);
  var giohang=ThongTinGioHang(req);
  var menu= await danhmuc.selectmenu();
  var chitietspcapnhap = await sanpham.selectforcapnhap(ma);
  res.render('capnhatsp',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,chitiet:chitietspcapnhap});
}
app.post('/capnhapsanpham/:ma', async function(req,res){
  var thongtin=req.body;
 // console.log(thongtin);
  var ma = req.params.ma;
	let sampleFile;
	let uploadPath;
	sampleFile = req.files.hinh_sp;
	tensanpham = thongtin.ten_sp;
	dongia = thongtin.don_gia;
  hinh = sampleFile.name;
	loai = thongtin.loai_sp;
	mota = thongtin.mo_ta;
	var kq = await sanpham.update(ma,loai,tensanpham,dongia,hinh,mota);
  if (!req.files || Object.keys(req.files).length===0){
		return res.status(400).send('No file were uploaded.');
	}
	uploadPath = __dirname +'/public/img/' + sampleFile.name;
	sampleFile.mv(uploadPath,function(err){
		if (err)
		return res.status(500).send(err);
	  res.redirect('/admin/sp');
})
})




app.get('/admin/xoaloai/:ma', async function(req,res){
  var ma = req.params.ma;
  var xoaloai = await danhmuc.delete(ma);
  res.redirect('/admin/loaisp');
})

app.get('/admin/xoasanpham/:ma', async function(req,res){
  var ma = req.params.ma;
  var xoasp = await sanpham.delete(ma);
  res.redirect('/admin/sp');
})




app.get('/admin/quanlidonhang', async function(req,res){
  var taikhoan=dangnhapadmin(req,res);
  var giohang=ThongTinGioHang(req)
  var menu= await danhmuc.selectmenu();
  var dsdonhang  = await donhang.selectforAdmin();
  var tongquan = await donhang.tongquan();
  res.render('quanlidonhang',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,dsdonhang:dsdonhang,tongquandoanhthu:tongquan});
})
app.get('/donhang/:donhang', async function(req,res){
  var ma = req.params.donhang;
  HienThiChiTietDonHang(req,res,ma);
})
async function HienThiChiTietDonHang(req,res,ma){
  var taikhoan=dangnhapadmin(req,res);
  var giohang=ThongTinGioHang(req);
  var menu= await danhmuc.selectmenu();
  var thongtindonhang = await donhang.selectdetail(ma);
  res.render('donhangedit',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,thongtindonhang:thongtindonhang});
}

//////////////////////////////
//End admin
/////////////////////////////
app.get('/:maloai', function(req, res) {
	var maloai=req.params.maloai;
	if(isNaN(maloai)==false)
	{
        HienThiDsSanPham(req,res,maloai); 
    }
    else if(maloai=="product"){
        HienThiDsSanPham(req,res,"");
    }
	else if(maloai=="dangki"){
		res.render('registration');
	}else if (maloai=="cart")
  {
    HienThiChiTietGioHang(req,res);
  }
   
});
app.get('/detail/:masp', function(req, res) {
	var masp=req.params.masp;
	
	if(isNaN(masp)==false)
	{
	 HienThiChiTiet(req,res,masp); 
	}
});
 

app.get('/mua/:ma',async function(req,res){
	var ma = req.params.ma;
	hm = await sanpham.selectByCode(ma);
	if (req.session.giohang==undefined){
		req.session.giohang=[];
		var h = {ma:ma,tensanpham:hm.nameProduct,giaban:hm.priceProduct,hinh:hm.imgProduct,soluong:1,thanhtien:hm.priceProduct};
		req.session.giohang[0]=h;
	}
	else{
		var co = 0;
		for (i=0;i<req.session.giohang.length;i++)
		if(req.session.giohang[i].ma==ma){
			//console.log(ma);
			req.session.giohang[i].soluong++;
			req.session.giohang[i].thanhtien=req.session.giohang[i].soluong*req.session.giohang[i].giaban;
			co=1;
			break;
		}
		if (co==0){
		var h = {ma:ma,tensanpham:hm.nameProduct,giaban:hm.priceProduct,hinh:hm.imgProduct,soluong:1,thanhtien:hm.priceProduct};
		req.session.giohang[req.session.giohang.length] = h;
		}
	}
  //console.log(req.session.giohang);

	//res.redirect('/'+hm.idCat);
  HienThiDsSanPham(req,res,hm.idCat);
})

app.get('/muasp/:ma/:soluong', async function(req,res){
  //console.log(12313);
	var ma = req.params.ma;
  sl = req.params.soluong;
  const x = parseInt(sl);
	hm = await sanpham.selectByCode(ma);
	if (req.session.giohang==undefined){
		req.session.giohang=[];
		var h = {ma:ma,tensanpham:hm.nameProduct,giaban:hm.priceProduct,hinh:hm.imgProduct,soluong:x,thanhtien:hm.priceProduct*x};
		req.session.giohang[0]=h;
	}
	else{
		var co = 0;
		for (i=0;i<req.session.giohang.length;i++)
		if(req.session.giohang[i].ma==ma){
        for (j=0;j<sl;j++)
          req.session.giohang[i].soluong++;
			req.session.giohang[i].thanhtien=req.session.giohang[i].soluong*req.session.giohang[i].giaban;
			co=1;
			break;
		}
		if (co==0){
		var h = {ma:ma,tensanpham:hm.nameProduct,giaban:hm.priceProduct,hinh:hm.imgProduct,soluong:x,thanhtien:hm.priceProduct*x};
		req.session.giohang[req.session.giohang.length] = h;
		}
	}
 // console.log(req.session.giohang);
  res.redirect('/cart');
})

app.get('/xoadonhang/:ma',function(req,res){
	var ma=req.params.ma;
	for (i=0;i<req.session.giohang.length;i++)
	if (req.session.giohang[i].ma==ma){
		req.session.giohang.splice(i,1);
		break;
	}
	res.redirect('/cart');
});

app.post('/search',function(req,res){
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  var tensanpham=req.body.tensp;
  HienThiTimKiem(req,res,tensanpham);
  })

app.post('/dangnhap', async(req,res)=> {
  var ttdangnhap=req.body;
	tendn=ttdangnhap.ho_ten;	
	matkhau=ttdangnhap.mat_khau;
  var user = await User.login(tendn,matkhau);
  if(!user){
    return res.status(401).send({ msg:'Thông tin đăng nhập sai. vui lòng kiểm tra lại thông tin đăng nhập'});
  }
  else if(user.isValid == false){
    return res.status(401).send({msg:'Email của bạn chưa được xác nhận . Vui lòng kiểm tra email của bạn'});
  }
  else{
    req.session.user=user;
    res.redirect('/');
  }
});

app.post('/admin', async(req,res)=> {
  var ttdangnhap=req.body;
	tendn=ttdangnhap.ho_ten;	
	matkhau=ttdangnhap.mat_khau;
 
  if(tendn=="admin" && matkhau=="admin12345"){
    res.redirect('/admin/loaisp');  
  }
  else{
    return res.status(401).send({ msg:'Thông tin đăng nhập sai. vui lòng kiểm tra lại thông tin đăng nhập'});
  }
});

app.post('/dangki', async(req,res)=>{
	var ttdangki=req.body;
	hoten=ttdangki.ho_ten;	
	email=ttdangki.email;
	matkhau=ttdangki.mat_khau;
  tendn=ttdangki.ten_dn;
  sodt=ttdangki.so_dt;
	diachi=ttdangki.dia_chi;
	var uniqueString= randString();
  var isValid=false;
  user= User.insert({name:hoten,email:email,uniquestring:uniqueString,isValid:isValid,password:matkhau,uname:tendn,address:diachi,phone:sodt});
  sendMail(email,uniqueString);
  hoten="";
  tendn=""
  diachi="";
  dienthoai="";
  email="";
  if (req.session.user!=""&&req.session.user!=undefined){
    hoten=req.session.user.name
    tendn=req.session.user.username;
    diachi=req.session.user.address;
    dienthoai=req.session.user.phone;
    email=req.session.user.email;
  }
  var taikhoan=dangnhap(req,res);
  req.session.giohang=null;
  giohang = req.session.giohang;
  var menu= await danhmuc.selectmenu();
	res.render('thanhcong',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,hoten:hoten,diachi:diachi,sodt:dienthoai,email:email});
  // return res.status(200).send("<p>Một email xác nhận đã được gửi đến " + email + ". Click vào link để được xác nhận đăng kí thành công.</p>");
  //req.flash("Một email xác nhận đã được gửi đến " + email + ". Click vào link để được xác nhận đăng kí thành công.");
  //res.redirect('/')
});



app.post('/capnhattaikhoan', async(req,res)=>{
	var ttcapnhat=req.body;
	hoten=ttcapnhat.ho_ten;	
	email=ttcapnhat.eamil;
	matkhau=ttcapnhat.mat_khau;
  tendn=ttcapnhat.ten_dn;
  sodt=ttcapnhat.so_dt;
	diachi=ttcapnhat.dia_chi;
  User.updatetaikhoan(req.session.user.username,hoten,tendn,sodt,email,diachi);
  req.session.user.username=tendn;
  req.session.user.name=hoten;
  req.session.user.email=email;
  req.session.user.address=diachi;
  req.session.user.username.phone=sodt;
  res.redirect('/taikhoan')
});

app.post('/thaydoimatkhau', async(req,res)=>{
	var ttmatkhau=req.body;
  matkhau=ttmatkhau.mat_khau;
  matkhauxn=ttmatkhau.mat_khau_xn
  User.updatepassword(req.session.user.username,matkhau);
  res.redirect('/taikhoan')
});

const randString = ()=>{
    const len=8;
    let randStr='';
    for(let i=0;i<len;i++){
        const ch=Math.floor((Math.random()*10)+1);
       randStr+=ch;
    }
    return randStr;
}


const sendMail= (email,uniqueString)=>{
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        auth: {
          user: 'myfarm.nongsansach@gmail.com',
          pass: 'oxcfgkjcigfqvgyj'
        }
      });
     
      var mailOptions = {
        from: 'myfarm.nongsansach@gmail.com',
        to: email,
        subject: 'Xác nhận đăng kí',
        text: 'Chào bạn!',
        html:"Click <a href='http://localhost:8000/verify/"+uniqueString+"'>here</a> to verity your email. Thank You!"
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

app.get('/verify/:uniqueString', async(req,res)=>{
  var unique =req.params;
  const{uniqueString}=req.params;
     //user= User.find({uniquestring:uniqueString});
     user= User.find(uniqueString);
    if(user){
       // user= User.update({uniquestring:uniqueString});
       user= User.update(uniqueString);
        res.redirect('/')
    }else{
        res.json('User not found')
    }
})

app.post('/xulydathang',async function(req,res){
	var thongtin = req.body;
	hoten = thongtin.ho_ten;
	diachi = thongtin.dia_chi;
	dienthoai = thongtin.so_dt;
	email = thongtin.email;
  var today = new Date();
  var ngaymua = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
  var dh = {sodh:1,hoten:hoten,diachi:diachi,dienthoai:dienthoai,email:email,ngaymua:ngaymua};
	dh.dsmh=req.session.giohang;
	kq=donhang.insert(dh);
	giohang = req.session.giohang;

	//gủi mail mail
	ttctgh="<h1 align='center'>Thông tin đơn hàng</h1>"
	ttctgh=ttctgh+"<p>Họ tên: "+hoten+"</p>";
	ttctgh=ttctgh+"<p>Địa chỉ: "+diachi+"</p>";
	ttctgh=ttctgh+"<p>Điện thoại: "+dienthoai+"</p>";
	ttctgh=ttctgh+"<p>Email: "+email+"</p>";
	ttctgh=ttctgh+"<table width='80%' cellspacing='0' cellpadding='2' border='1'>";
	ttctgh=ttctgh+"<tr><td width = '10%'>STT</td><td width='10%'>Mã sp</td><td width='30%'>Tên sp</td><td width='10%'>Số lượng</td><td width='15%'>Đơn giá</td><td>Tổng tiền</td></tr>";
	var tongtien=0;
	var stt=1;
		for (i=0;i<giohang.length;i++){
			ttctgh=ttctgh+"<tr><td>"+stt+"</td><td>"+giohang[i].ma+"</td><td>"+giohang[i].tensanpham+"</td><td>"+giohang[i].soluong+"</td><td>"+giohang[i].giaban+"đ</td><td>"+giohang[i].soluong*giohang[i].giaban+"đ</td></tr>";
			stt++;
			tongtien = tongtien + giohang[i].soluong*giohang[i].giaban;
		}
		ttctgh = ttctgh +"<tr><td colspan = '7' align='right'>Tổng tiền: "+tongtien+"đ</td></tr></table>";
		ttctgh = ttctgh +"<p>Cảm ơn quý khách đã đặt hàng, đơn hàng sẽ chuyến đền quý khách trong thời gian sớm nhất";
		mail(email,"Đơn hàng Shop My Farm",ttctgh);

	if (kq)
	req.session.giohang=null;
 /* var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)*/
  var madh= await donhang.selectmadh();
  madh=madh+1;
	res.redirect('/xulydathang/'+madh)
})

function mail(tomail,tieude,noidung){
	var transporter=nodemailer.createTransport({
	service: 'gmail',
	auth: {
    user: 'myfarm.nongsansach@gmail.com',
    pass: 'oxcfgkjcigfqvgyj'
	}
});

var mailOptions = {
	from: 'myfarm.nongsansach@gmail.com',
	to: tomail,
	subject: tieude,
	html: noidung
}

transporter.sendMail(mailOptions, function(error, info){
	if (error) {
	  console.log(error);
	} else {
	  console.log('Email sent: ' + info.response);
	}
  });
}
async function HienThi(req,res)
{
   var dssanphamnoibat=await sanpham.selectsanphamnoibat();
   var dssanphamganday=await sanpham.selectsanphamnoibat();
   var taikhoan=dangnhap(req,res);
	 var giohang=ThongTinGioHang(req)
   var menu= await danhmuc.selectmenu();
   res.render('index',{spnoibat:dssanphamnoibat,spganday:dssanphamganday,dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu}); 
}
 

async function HienThiDsSanPham(req,res,maloai)
{
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req);
  var menu= await danhmuc.selectmenu();
    var danhmucsanpham= await danhmuc.select();
    var dssanpham=await sanpham.select(maloai);
    res.render('product-list',{danhmucsp:danhmucsanpham,danhsachsanpham:dssanpham,dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu});
}

async function HienThiTimKiem(req,res,tensanpham)
{  
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  var menu= await danhmuc.selectmenu();
  var danhmucsp=await danhmuc.select()
	var dsachtimkiem=await sanpham.timKiem(tensanpham);
	res.render('product_search',{dstimkiem:dsachtimkiem,dangnhap:taikhoan,ttgiohang:giohang,danhmucsp:danhmucsp,menuloaisp:menu});
}

async function HienThiChiTiet(req,res,masp)
{
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  var menu= await danhmuc.selectmenu();
  var danhmucsp=await danhmuc.select()
	var ttchitietsanpham=await sanpham.selectChitiet(masp);
	var dssanphamlienquan=await sanpham.selectsplienquan(masp);
  var motasp=await sanpham.mota(masp);
    res.render('product-detail',{chitietsp:ttchitietsanpham,splienquan:dssanphamlienquan,dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,danhmucsp:danhmucsp,mota:motasp});
}

function dangnhap(req,res){
  var taikhoan="";
   if (req.session.user!=undefined && req.session.user!=""){
      tenkh="Chào, " +req.session.user.username;
      taikhoan=taikhoan+ "<a href='#' class='dropdown-toggle' data-toggle='dropdown'>"+tenkh+"</a>"
                        +"<div class='dropdown-menu'>"
                              +"<a href='/taikhoan' class='dropdown-item'>Tài khoản</a>"
                              +"<a href='/dangxuat' class='dropdown-item'>Đăng xuất</a>"
                              +"<a href='/admin' class='dropdown-item'>Quản trị</a>"
                        +"</div>"
   }else{
    taikhoan=taikhoan+ "<a href='#' class='dropdown-toggle' data-toggle='dropdown'>Tài khoản</a>"
     +"<div class='dropdown-menu'>"
        +"<a href='/dangnhap' class='dropdown-item'>Đăng nhập</a>"
        +"<a href='/dangki' class='dropdown-item'>Đăng kí</a>"
    +"</div>"
   }
   return taikhoan;
}

function dangnhapadmin(req,res){
  var ten="";
  ten=ten+ "<a href='#' class='dropdown-toggle' data-toggle='dropdown'>admin</a>"
     +"<div class='dropdown-menu'>"
        +"<a href='/dangxuat' class='dropdown-item'>Đăng xuất</a>"
    +"</div>"
  return ten;
}

function ThongTinGioHang(req){
	var ttgh="";
	var sl=0;
	if (req.session.giohang!=undefined){
		for (i=0;i<req.session.giohang.length;i++){
			sl = sl + req.session.giohang[i].soluong; 
		}
    ttgh = "<span style='color:red;'>("+sl+")</span>"
	}	
  else{
    ttgh ="<span>("+sl+")</span>"
  }
	return ttgh;
}

async function HienThiChiTietGioHang(req,res){
	var giohang = req.session.giohang;
	var kq="<tbody class='align-middle'>";
  var phigiaohang=""
  var tongtien=0;
	if (giohang!=undefined){
      for (i=0;i<giohang.length;i++){
          kq=kq+"<tr>";
          kq=kq+"<td><img src='../img/"+giohang[i].hinh+"' alt='Image'></a></td>";
          kq=kq+"<td>"+giohang[i].tensanpham+"</a></td>";
          kq=kq+"<td>"+giohang[i].giaban+"</td>";
          kq=kq+"<td>";
          kq=kq+"<button onclick=tru("+giohang[i].ma+") ><i class='fa fa-minus'></i></button>";
          kq=kq+"<input type='text' value='"+giohang[i].soluong+"' id='"+giohang[i].ma+"' name='txtsl"+giohang[i].ma+"'/>";
          kq=kq+"<button onclick=cong("+giohang[i].ma+")><i class='fa fa-plus'></i></button>";
          kq=kq+"</td>";
          kq=kq+"<td>"+giohang[i].soluong*giohang[i].giaban+"</td>";
          kq=kq+"<td><a href='#' onclick='Xoadonhang("+giohang[i].ma+")'><i class='fa fa-trash'></i></a></td>";          kq=kq+"</tr>";
          tongtien = tongtien + giohang[i].soluong*giohang[i].giaban;
      }
	}
	kq=kq+"</tbody>"
  /*var ship=0.1*tongtien;
  var tongchiphi=ship+tongtien;*/
  phigiaohang= phigiaohang+"<p>Tổng cộng<span>"+tongtien+"đ</span></p>"
  +"<p>Phụ phí<span>0đ</span></p>"
  +"<h4>Tổng tiền<span>"+tongtien+"đ</span></h4>"
  var taikhoan=dangnhap(req,res);
  var giohang=ThongTinGioHang(req)
  var menu= await danhmuc.selectmenu();
  res.render('cart',{dangnhap:taikhoan,ttgiohang:giohang,menuloaisp:menu,chitietgiohang:kq,tonggiohang:phigiaohang});
}


app.post('/capnhapgiohang', function(req,res){
	var thongtin=req.body;
  
	for (i=0;i<req.session.giohang.length;i++){
		req.session.giohang[i].soluong=eval("thongtin.txtsl"+req.session.giohang[i].ma)*1;
	}
 
	res.redirect('/cart');
})
 app.listen(8000);
console.log('8000 is the magic port');
