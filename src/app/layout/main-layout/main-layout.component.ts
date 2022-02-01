import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RepositoryService } from 'src/app/service/repository.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  list: any
  menuicon: string = 'menu';
  selectedItem: any;
  constructor(private service: RepositoryService, private router: Router) { }
  user: any;
  ngOnInit() {
    this.user = this.service.user();
    console.log(this.user, this.service.user())

  }
  activatelink(data: any) {
    this.list.forEach((element: any) => {
      element.classList.remove('active');
    });
    data.classList.add('active')
  }
  togglemenu() {
    if (this.menuicon == 'menu') {
      this.menuicon = 'menu_open'
      document.getElementById('sidenav')!.style.width = "200px";
      document.getElementById("col1")!.className = "col-md-2";
      document.getElementById("col11")!.className = "col-md-10";
    }
    else {
      this.menuicon = 'menu'
      document.getElementById('sidenav')!.style.width = "80px";
      document.getElementById("col1")!.className = "col-md-1";
      document.getElementById("col11")!.className = "col-md-11";
    }
  }
  listClick(e: any) {
    if (document.querySelector('.list .active') !== null) {
      document.querySelector('.list .active')!.classList.remove('active');
    }
    e.currentTarget.className = "list active";
  }
  logout() {
    Swal.fire({
      title: 'Do you want to logout?',
      showCancelButton: true,
      confirmButtonText: `Yes`,
      denyButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem('idtoken');
        console.log(sessionStorage.getItem('idtoken'));
        this.router.navigate([""]);
      }
    });
  }

}
