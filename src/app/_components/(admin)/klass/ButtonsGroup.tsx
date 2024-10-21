"use client";

import * as React from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import AddUser from "./AddUser";

interface Props {
  klassId: string;
}

export default function ButtonsGroup({ klassId }: Props) {
  const [isAddingStudent, setIsAddingStudent] = React.useState(false);
  const [isAddingTeacher, setIsAddingTeacher] = React.useState(false);

  const getStudents = api.user.getAllStudents.useQuery();
  const getTeachers = api.user.getAllTeachers.useQuery();

  const utils = api.useUtils();

  const addStudentMutation = api.klass.addStudent.useMutation({
    onSuccess: () => {
      setIsAddingStudent(false);
      void utils.klass.getKlassStudents.invalidate();
      toast.success(`Учня додано до класу`);
    },

    onError: () => {
      toast.error(`Виникла помилка під час додавання учня до класу`);
    },
  });

  const addTeacherMutation = api.klass.addTeacher.useMutation({
    onSuccess: () => {
      setIsAddingTeacher(false);
      void utils.klass.getKlassTeachers.invalidate();
      toast.success(`Викладача додано до класу`);
    },

    onError: () => {
      toast.error(`Виникла помилка під час додавання викладача до класу`);
    },
  });

  return (
    <div className="flex items-center flex-wrap gap-2">
      <AddUser
        users={getStudents.data}
        open={isAddingStudent}
        onOpenChange={setIsAddingStudent}
        onClick={(id) => addStudentMutation.mutate({ klassId, studentId: id })}
        isFetching={getStudents.isFetching}
        isPending={addStudentMutation.isPending}
        emptyMessage="Учнів не знайдено"
        notFoundMessage="Учнів з такою назвою не знайдено"
      >
        Додати учня
      </AddUser>

      <AddUser
        users={getTeachers.data}
        open={isAddingTeacher}
        onOpenChange={setIsAddingTeacher}
        onClick={(id) => addTeacherMutation.mutate({ klassId, teacherId: id })}
        isFetching={getTeachers.isFetching}
        isPending={addTeacherMutation.isPending}
        emptyMessage="Викладачів не знайдено"
        notFoundMessage="Викладачів з такою назвою не знайдено"
      >
        Додати викладача
      </AddUser>
    </div>
  );
}
