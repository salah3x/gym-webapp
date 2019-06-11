import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  @ViewChild('i18n', { static: false }) public i18n: ElementRef;
  hide = true;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<SigninComponent>,
    private snackbar: MatSnackBar,
    private auth: AngularFireAuth
  ) {}

  ngOnInit() {}

  onSubmit(f: NgForm) {
    this.loading = true;
    this.auth.auth
      .signInWithEmailAndPassword(f.value.email, f.value.password)
      .then(value => {
        this.snackbar.open(
          this.i18n.nativeElement.childNodes[0].textContent +
            ' ' +
            value.user.email,
          'X',
          { duration: 3000 }
        );
        this.dialogRef.close();
      })
      .catch(() => {
        this.snackbar.open(
          this.i18n.nativeElement.childNodes[1].textContent,
          'X',
          { duration: 3000 }
        );
        this.loading = false;
      });
  }

  onForget(email: string) {
    if (confirm(this.i18n.nativeElement.childNodes[2].textContent)) {
      this.auth.auth
        .sendPasswordResetEmail(email)
        .then(() =>
          this.snackbar.open(
            this.i18n.nativeElement.childNodes[3].textContent,
            'X',
            { duration: 3000 }
          )
        )
        .catch(() =>
          this.snackbar.open(
            this.i18n.nativeElement.childNodes[4].textContent,
            'X',
            { duration: 3000 }
          )
        );
    }
  }
}
