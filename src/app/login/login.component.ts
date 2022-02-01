import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RepositoryService } from '../service/repository.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = new FormControl('', [Validators.required, Validators.email]);
  validcredential:boolean=false;
  //userpassword = new FormControl('', [Validators.required, Validators.email]);
  getErrorMessage() {
    if (this.username.hasError('required')) {
      return 'You must enter a value';
    }
    return this.username.hasError('email') ? 'Not a valid email' : '';
  }
  constructor(private router: Router, private service: RepositoryService) { }

  // email:string=''
  // password:any=''
  loginData: any = { email: "", password: "" }
  ngOnInit(): void {
  }
  login() {
    console.log(this.loginData)
    sessionStorage.removeItem('idtoken');
    if (this.loginData.email && this.loginData.password) {
      this.service.signIn(this.loginData).subscribe(res => {
        if (res['status'] == 200) {
        this.service.setUser(res['user'])
        sessionStorage.setItem('idtoken', res.token)
        // sessionStorage.setItem("email", this.email);
        // sessionStorage.setItem("password", this.password);
        this.router.navigate(['/file'])
        }
        else{
          this.validcredential=true;
        }
       
      });

    }
  }

}
