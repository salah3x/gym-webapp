import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {NgForm} from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  hide = true;
  loading = false;

  constructor(private dialogRef: MatDialogRef<SigninComponent>,
              private snackbar: MatSnackBar,
              private auth: AngularFireAuth) { }

  ngOnInit() {
  }

  onSubmit(f: NgForm) {
    this.loading = true;
    this.auth.auth.signInWithEmailAndPassword(f.value.email, f.value.password).then(value => {
      this.snackbar.open('Bonjour ' + value.user.email, 'Fermer', {duration: 3000});
      this.dialogRef.close();
    }).catch(reason => {
      this.snackbar.open('Connexion échouée, vérifiez vos informations.', 'Fermer', {duration: 3000});
      this.loading = false;
    });
  }

  onForget(email: string) {
    this.auth.auth.sendPasswordResetEmail(email).then(() => this.snackbar.open('Vérifier vôtre email.', 'Fermer', {duration: 3000}));
  }
}
