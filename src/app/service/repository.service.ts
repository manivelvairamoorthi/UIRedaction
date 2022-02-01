import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http'
import { Observable, Observer, throwError, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  constructor(private router: Router,
    public http: HttpClient,) { }

  signIn(requestdata: any): Observable<any> {
    return this.http.post(environment.apiEndPoint + 'api/account/login/', requestdata);
  }
  setUser(user: any) {
    console.log("user", user)
    sessionStorage.setItem('user', JSON.stringify(user))
    console.log("sessionStorage.getItem", sessionStorage.getItem("user"))
  }
  user() {
    console.log("11111111111", sessionStorage.getItem('user'))
    let user = sessionStorage.getItem('user')
    if (user)
      return JSON.parse(user)
    else
      return {};
  }
  token() {
    let tokenVal: any = ''
    if (sessionStorage.getItem("idtoken"))
      tokenVal = sessionStorage.getItem("idtoken")
    return tokenVal
  }
  getUser(): Observable<any> {
    return this.http.get(environment.apiEndPoint + 'api/account/user_list/');

  }
  deleteFile(data:any){
    return this.http.post(environment.apiEndPoint + 'api/file/delete/',data)
  }

  uploadExcelFile(data:any){
    return this.http.post(environment.apiEndPoint+'api/file/upload_file/',data)
  }

  getAllExcelFile(){
    return this.http.get(environment.apiEndPoint+'api/file/list/');
  }
  public parseISOString(s:any) {
    let temp= s.split('T');
    let temp1 = temp[0]+" "+temp[1].split('.')[0];
    return temp1.slice(0,-1);
  }
  autoRedact(data:any){
    console.log('AutoReduct'+data);
    return this.http.post(environment.apiEndPoint+'api/file/redact/',data);
  }
  delete(data:any){
    return this.http.post(environment.apiEndPoint+'api/account/delete/',data);
  }
  saveExcel(excelData:any,fileData:any){
    let data:any = {};
    return this.http.post(environment.apiEndPoint+'api/file/updateExcel/',data={'exceldata':excelData, 'filedata':fileData});
  }
  //dashboard count api start
  redactCount(): Observable<any> {
    return this.http.get(environment.apiEndPoint + 'api/file/dashboard/');

  }
  //dashboard count api end

  compareExcel(data:any){
    return this.http.post(environment.apiEndPoint + 'api/file/compare/',data)
  }

}
