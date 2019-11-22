var canvas = document.getElementById("edge-detection");
var canvas1 = document.getElementById("original");
var ctx = canvas.getContext("2d");
var ctx1 = canvas1.getContext("2d");
var img = new Image()
img.crossOrigin = '';
img.src = "https://raw.githubusercontent.com/GiovaniValdrighi/Edge_Detection_CG/master/peppers.png"
img.onload = function(){
    ctx1.drawImage(img, 0, 0);
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, img.width, img.height);

    //grayscale
    for (let i = 0; i < data.data.length; i+=4){
        aux = (data.data[i] + data.data[i+1] + data.data[i+2])/3;
		data.data[i] = aux;
		data.data[i+1] = aux;
		data.data[i+2] = aux;
    }

    //sobel
    var Ix = new Uint8ClampedArray(data.data);
    var Iy = new Uint8ClampedArray(data.data);
    for (let i = 0; i < data.data.length; i+= 4){
        //gradient at X axis
        Ix[i] = (-1 * (data.data[i + (-4) + (-4*img.width)] || 0) 
            -2 * (data.data[i + (-4)] || 0) 
            -1 * (data.data[i + (-4) + (4*img.width)] || 0)
            +1 * (data.data[i + (+4) + (-4*img.width)] || 0)
            +2 * (data.data[i + (+4)] || 0)
            +1 * (data.data[i + (+4) + (4*img.width)] || 0));
        //gradient at Y axis
        Iy[i] =  (-1 * (data.data[i + (-4) + (-4*img.width)] || 0) 
            -2 * (data.data[i + (-4*img.width)] || 0) 
            -1 * (data.data[i + (+4) + (-4*img.width)] || 0)
            +1 * (data.data[i + (-4) + (+4*img.width)] || 0)
            +2 * (data.data[i + (+4*img.width)] || 0)
            +1 * (data.data[i + (+4) + (4*img.width)] || 0));
        Ix[i+1] = Ix[i]; Ix[i+2] = Ix[i];
        Iy[i+1] = Iy[i]; Iy[i+2] = Iy[i];
    }

    var dist = 1; var method = "mom";
    document.getElementById("go").addEventListener("click", function go(){
        //getting type of inference
        if(document.getElementById('d1').checked){
            dist = document.getElementById('d1').value;
        }else{
            dist = document.getElementById('d2').value;
        }
        if(document.getElementById('mom').checked){
            method = document.getElementById('mom').value;
        }else{
            method = document.getElementById('cos').value;
        }
        dp = document.getElementById("dp").value;

        //fuzzy control
        for(let i = 0; i < data.data.length; i +=4){
            mu_ix = (Math.exp(Math.pow(Ix[i]/(dp*255),2)*(-0.5)));
            mu_iy = (Math.exp(Math.pow(Iy[i]/(dp*255),2)*(-0.5)));
            mu_b_iout = Math.min(mu_ix, mu_iy);
            mu_w_iout = Math.max(1 - mu_ix, 1 - mu_iy);
            
            //dist points values
            if(dist == 1){
                a = 0.0;
                b = 140 + mu_b_iout*(-140);
                d = 120 + mu_w_iout*135;
                e = 255;
            }else{
                a = 0.0;
                b = 40  + mu_b_iout*(-20);
                d = 50*215/20 + mu_w_iout*50;
                e = 255;
            }

            //calculating value
            if(method == "mom"){
                if(mu_w_iout > mu_b_iout){
                    lom = e;
                    fom = d;
                    mom = (fom + lom)/2;
                }else if(mu_w_iout < mu_b_iout){
                    fom = a;
                    lom = b;
                    mom = (fom + lom)/2;
                }else{
                    fom = 0.5; lom = 0.5; mom = 0.5;
                }
                data.data[i] = lom;
                data.data[i+1] = lom;
                data.data[i+2] = lom;
            }else{
                A1 = mu_b_iout*(b - a);
                A2 = mu_b_iout*(0.7 - b)/2;
                cx1 = (b - a)/2;
                cx2 = (b + b + 0.7)/3;
                cxb = (A1*cx1 + A2*cx2)/(A1+A2);
                A3 = mu_w_iout*(d - 0.1)/2;
                A4 = mu_w_iout*(e-d);
                cx3 = (d + d + 0.1)/3;
                cx4 = (e -d)/2;
                cxw = (A3*cx3 + A4*cx4)/(A3 + A4);
                cx = ((A1+A2)*cxb + (A3+A4)*cxw)/(A1+A2+A3+A4);
                data.data[i] = cx;
                data.data[i+1] = cx;
                data.data[i+2] = cx;
            }
        }
        console.log(data);
        ctx.putImageData(data, 0, 0);
    });

}
