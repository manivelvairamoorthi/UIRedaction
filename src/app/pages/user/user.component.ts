import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RepositoryService } from 'src/app/service/repository.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {


  constructor(private service: RepositoryService) { }
  displayedColumns: string[] = ['id', 'user_name', 'email', 'action'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.userList();
  }
  userList() {
    this.service.getUser().subscribe(res => {
      this.dataSource = new MatTableDataSource(res['data']);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }
  delete(data: any) {
    console.log(data.id);
    let temp = { id: null };
    temp.id = data.id;
    console.log(temp)
    Swal.fire({
      title: 'Do you want to delete this user?',
      showCancelButton: true,
      confirmButtonText: `Yes`,
      denyButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete(temp).subscribe(data => {
          Swal.fire('User has deleted successfully', '', 'success');
          this.userList();
        });
      }
    });
  }

}
