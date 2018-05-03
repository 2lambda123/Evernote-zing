---
id: initial-setup
title: Initial Setup
---

Once Zing has been installed, you will need to initialize its configuration file:

```shell
zing init
```

The configuration file is saved as `~/.zing/zing.conf`.

The initial configuration only includes the settings that you're most likely to
change. For further customization, check the [settings
reference](ref-settings.md).


## Running Workers

Statistics tracking and other background processes are managed by [RQ](
http://python-rq.org/). The `rqworker` command needs to be continuously running
in order to process such jobs.

You can start the worker in the background with the following command:

```shell
zing rqworker &
```

## Populating the Database

Once the workers are running and before you run Zing for the first time, you
need to create the schema for the database and populate it with initial data.
This is done by executing the `migrate` and `initdb` management commands:


```shell
zing migrate
zing initdb
```

Running `initdb` will take some time as it will create the default projects and
populate them with default data.


## Creating an Admin User

Zing needs at least one user with superuser rights which we create with the
`createsuperuser` command.

```shell
zing createsuperuser
```

All users are required to verify their email before logging in. If you wish to
bypass this step for the user you just created, you can use the `verify_user` command.

```shell
zing verify_user admin
```

## Running Zing

The Django default server will be enough for **quickly testing** the software:

```shell
zing runserver --insecure
```

The Zing server will start listening on port 8000, which can be accessed from
your web browser at [localhost:8000](http://localhost:8000/).