import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, PaymentStatus, StudentStatus, CourseEnrollment } from '../../types';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  DollarSign,
  GraduationCap,
  ShoppingBag,
  FileText,
  Calendar,
  Phone,
  Cake,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

export const StudentsManager: React.FC = () => {
  const {
    students,
    courses,
    orders,
    addStudent,
    updateStudent,
    deleteStudent,
    enrollStudentInCourse,
    updateStudentEnrollment,
    deleteStudentEnrollment,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  
  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [dossierStudent, setDossierStudent] = useState<Student | null>(null);
  const [isEnrollNewCourseModalOpen, setIsEnrollNewCourseModalOpen] = useState(false);

  // Form state for basic student registration / editing
  const [fullName, setFullName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [initialCourseId, setInitialCourseId] = useState(courses[0]?.id || '');
  const [initialTuitionTotal, setInitialTuitionTotal] = useState<number>(0);
  const [initialTuitionPaid, setInitialTuitionPaid] = useState<number>(0);
  const [initialPaymentStatus, setInitialPaymentStatus] = useState<PaymentStatus>('pending');
  const [initialCertificateIssued, setInitialCertificateIssued] = useState(false);
  const [notes, setNotes] = useState('');

  // Form state for adding an additional course to an existing student
  const [targetStudentForNewCourse, setTargetStudentForNewCourse] = useState<Student | null>(null);
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [newCourseTuition, setNewCourseTuition] = useState<number>(0);
  const [newCoursePaid, setNewCoursePaid] = useState<number>(0);
  const [newCourseNotes, setNewCourseNotes] = useState('');

  const openAddStudentModal = () => {
    setEditingStudent(null);
    setFullName('');
    setNationalCode('');
    setPhone('');
    setEmail('');
    const firstCourse = courses[0];
    setInitialCourseId(firstCourse?.id || '');
    setInitialTuitionTotal(firstCourse?.discountPrice || firstCourse?.price || 0);
    setInitialTuitionPaid(0);
    setInitialPaymentStatus('pending');
    setInitialCertificateIssued(false);
    setNotes('');
    setIsAddEditModalOpen(true);
  };

  const openEditStudentModal = (student: Student) => {
    setEditingStudent(student);
    setFullName(student.fullName);
    setNationalCode(student.nationalCode);
    setPhone(student.phone);
    setEmail(student.email || '');
    setNotes(student.notes || '');
    setIsAddEditModalOpen(true);
  };

  const openEnrollNewCourseModal = (student: Student) => {
    setTargetStudentForNewCourse(student);
    const availableCourse = courses.find((c) => !(student.enrollments || []).some((e) => e.courseId === c.id)) || courses[0];
    setNewCourseId(availableCourse?.id || courses[0]?.id || '');
    setNewCourseTuition(availableCourse?.discountPrice || availableCourse?.price || 0);
    setNewCoursePaid(0);
    setNewCourseNotes('');
    setIsEnrollNewCourseModalOpen(true);
  };

  const handleInitialCourseSelect = (courseId: string) => {
    setInitialCourseId(courseId);
    const selected = courses.find((c) => c.id === courseId);
    if (selected) {
      setInitialTuitionTotal(selected.discountPrice || selected.price);
    }
  };

  const handleNewCourseSelect = (courseId: string) => {
    setNewCourseId(courseId);
    const selected = courses.find((c) => c.id === courseId);
    if (selected) {
      setNewCourseTuition(selected.discountPrice || selected.price);
    }
  };

  const handleAddOrEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showToast('لطفاً نام و شماره همراه هنرجو را وارد فرمایید.', 'error');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        fullName: fullName.trim(),
        nationalCode: nationalCode.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setIsAddEditModalOpen(false);
    } else {
      const courseObj = courses.find((c) => c.id === initialCourseId);
      const courseTitle = courseObj ? courseObj.title : 'دوره آموزشی فندق';

      addStudent({
        fullName: fullName.trim(),
        nationalCode: nationalCode.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        courseId: initialCourseId,
        courseTitle,
        tuitionTotal: Number(initialTuitionTotal),
        tuitionPaid: Number(initialTuitionPaid),
        paymentStatus: initialPaymentStatus,
        certificateIssued: initialCertificateIssued,
        notes: notes.trim() || undefined,
      });
      setIsAddEditModalOpen(false);
    }
  };

  const handleEnrollNewCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForNewCourse || !newCourseId) return;

    const courseObj = courses.find((c) => c.id === newCourseId);
    const courseTitle = courseObj ? courseObj.title : 'دوره آموزشی فندق';

    enrollStudentInCourse(targetStudentForNewCourse.id, {
      courseId: newCourseId,
      courseTitle,
      tuitionTotal: Number(newCourseTuition),
      tuitionPaid: Number(newCoursePaid),
      notes: newCourseNotes.trim() || undefined,
    });

    setIsEnrollNewCourseModalOpen(false);

    // If dossier modal is currently open for this student, update it
    if (dossierStudent && dossierStudent.id === targetStudentForNewCourse.id) {
      const updated = students.find((s) => s.id === targetStudentForNewCourse.id);
      if (updated) setDossierStudent(updated);
    }
  };

  // Helper calculations for a student
  const getStudentStats = (student: Student) => {
    const enrollments = student.enrollments && student.enrollments.length > 0
      ? student.enrollments
      : [
          {
            id: 'legacy-1',
            courseId: student.courseId || 'course-1',
            courseTitle: student.courseTitle || 'دوره تخصصی فندق',
            enrolledAt: student.registrationDate || student.createdAt || '۱۴۰۳',
            tuitionTotal: student.tuitionTotal || 0,
            tuitionPaid: student.tuitionPaid || 0,
            paymentStatus: student.paymentStatus || 'pending',
            certificateIssued: student.certificateIssued || false,
            status: student.status || 'active',
          } as CourseEnrollment
        ];

    const totalTuition = enrollments.reduce((sum, e) => sum + (e.tuitionTotal || 0), 0);
    const totalPaid = enrollments.reduce((sum, e) => sum + (e.tuitionPaid || 0), 0);
    const totalRemaining = totalTuition - totalPaid;
    const certificatesCount = enrollments.filter((e) => e.certificateIssued).length;

    // Student's pastry orders (matching by phone or name)
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const studentOrders = orders.filter((o) => {
      const orderPhoneClean = o.customerPhone.replace(/[^0-9]/g, '');
      return (cleanPhone && orderPhoneClean.includes(cleanPhone)) || o.customerName === student.fullName;
    });

    const ordersTotalSpend = studentOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      enrollments,
      totalTuition,
      totalPaid,
      totalRemaining,
      certificatesCount,
      studentOrders,
      ordersTotalSpend,
    };
  };

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        (s.nationalCode && s.nationalCode.includes(searchQuery));

      const { enrollments } = getStudentStats(s);
      const matchesCourse =
        courseFilter === 'all' || enrollments.some((e) => e.courseId === courseFilter);

      return matchesSearch && matchesCourse;
    });
  }, [students, searchQuery, courseFilter]);

  // Overall metrics across all students
  const aggregateMetrics = useMemo(() => {
    let allTuition = 0;
    let allPaid = 0;
    let totalEnrollmentsCount = 0;

    students.forEach((s) => {
      const stats = getStudentStats(s);
      allTuition += stats.totalTuition;
      allPaid += stats.totalPaid;
      totalEnrollmentsCount += stats.enrollments.length;
    });

    return {
      allTuition,
      allPaid,
      allRemaining: allTuition - allPaid,
      totalEnrollmentsCount,
    };
  }, [students]);

  // Keep dossierStudent in sync with context
  const activeDossierStudent = useMemo(() => {
    if (!dossierStudent) return null;
    return students.find((s) => s.id === dossierStudent.id) || dossierStudent;
  }, [dossierStudent, students]);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">مدیریت هنرجویان و پرونده جامع سوابق</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            ثبت‌نام چنددوره همزمان برای هر هنرجو، سوابق سفارشات کیک و دسر، وضعیت اقساط و مدارک
          </p>
        </div>

        <button
          onClick={openAddStudentModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت هنرجوی جدید</span>
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>تعداد هنرجویان:</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <span className="text-xl font-black text-stone-900 tabular-nums">
            {students.length} <span className="text-xs font-normal text-stone-500">نفر</span>
          </span>
          <span className="text-[10px] text-stone-400 block mt-1">
            مجموعاً {aggregateMetrics.totalEnrollmentsCount} دوره ثبت‌نامی
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>شهریه کل دوره‌ها:</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <span className="text-xl font-black text-stone-900 tabular-nums">
            {aggregateMetrics.allTuition.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">تومان</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>شهریه وصول‌شده:</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-emerald-800 tabular-nums">
            {aggregateMetrics.allPaid.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">تومان</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>مانده مطالبات شهریه:</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-black text-amber-900 tabular-nums">
            {aggregateMetrics.allRemaining.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">تومان</span>
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام هنرجو، شماره همراه یا کد ملی..."
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none text-stone-700 max-w-xs truncate"
          >
            <option value="all">فیلتر بر اساس دوره (همه دوره‌ها)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold">
              <tr>
                <th className="py-3 px-4">هنرجو</th>
                <th className="py-3 px-4">تماس و هویت</th>
                <th className="py-3 px-4">دوره‌های ثبت‌نامی</th>
                <th className="py-3 px-4 text-left">مجموع شهریه و مانده</th>
                <th className="py-3 px-4 text-center">سفارشات قنادی</th>
                <th className="py-3 px-4 text-center">پرونده و عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    هنرجویی با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const stats = getStudentStats(student);
                  return (
                    <tr key={student.id} className="hover:bg-stone-50/80 transition-colors">
                      
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setDossierStudent(student)}
                          className="font-bold text-stone-900 hover:text-amber-800 text-right block"
                        >
                          {student.fullName}
                        </button>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          عضویت: {student.createdAt || student.registrationDate || '۱۴۰۳'}
                        </span>
                      </td>

                      {/* Phone & ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-stone-800 block tabular-nums">{student.phone}</span>
                        <span className="text-[11px] text-stone-400 block tabular-nums">
                          کد ملی: {student.nationalCode || '---'}
                        </span>
                      </td>

                      {/* Courses Enrolled */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200/60 tabular-nums">
                            {stats.enrollments.length} دوره
                          </span>
                          <span className="text-[11px] text-stone-600 truncate max-w-[170px] inline-block">
                            {stats.enrollments.map((e) => e.courseTitle).join('، ')}
                          </span>
                        </div>
                      </td>

                      {/* Financial status */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-stone-900 tabular-nums">
                            {stats.totalPaid.toLocaleString('fa-IR')} / {stats.totalTuition.toLocaleString('fa-IR')} تومان
                          </span>
                          <span
                            className={`text-[10px] font-semibold mt-0.5 ${
                              stats.totalRemaining === 0
                                ? 'text-emerald-700'
                                : 'text-amber-800'
                            }`}
                          >
                            {stats.totalRemaining === 0
                              ? '✓ تسویه کامل'
                              : `مانده: ${stats.totalRemaining.toLocaleString('fa-IR')} تومان`}
                          </span>
                        </div>
                      </td>

                      {/* Pastry Orders Count */}
                      <td className="py-3.5 px-4 text-center">
                        {stats.studentOrders.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                            <Cake className="w-3 h-3" />
                            <span>{stats.studentOrders.length} سفارش</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">بدون سفارش</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Dossier Button */}
                          <button
                            onClick={() => setDossierStudent(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                            title="مشاهده سوابق و پرونده جامع"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>سوابق</span>
                          </button>

                          {/* Enroll in another course button */}
                          <button
                            onClick={() => openEnrollNewCourseModal(student)}
                            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-amber-900"
                            title="ثبت‌نام در دوره جدید"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-800" />
                          </button>

                          {/* Edit info */}
                          <button
                            onClick={() => openEditStudentModal(student)}
                            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                            title="ویرایش مشخصات"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`آیا از حذف پرونده هنرجو «${student.fullName}» و کلیه سوابق ایشان اطمینان دارید؟`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: STUDENT DOSSIER (پرونده و سوابق جامع هنرجو) */}
      {/* ============================================================== */}
      {activeDossierStudent && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto text-right space-y-6">
            
            {/* Dossier Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-xl bg-amber-800 text-white font-black text-sm flex items-center justify-center">
                    {activeDossierStudent.fullName.slice(0, 1)}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-lg text-stone-900">
                      پرونده جامع: {activeDossierStudent.fullName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                      <span className="tabular-nums">تلفن: {activeDossierStudent.phone}</span>
                      <span>·</span>
                      <span className="tabular-nums">کد ملی: {activeDossierStudent.nationalCode || '---'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDossierStudent(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick KPI Bar for this student */}
            {(() => {
              const stats = getStudentStats(activeDossierStudent);
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                  <div>
                    <span className="text-stone-500 block mb-0.5">دوره‌های آموزشی:</span>
                    <span className="font-black text-stone-900 text-base tabular-nums">
                      {stats.enrollments.length} دوره
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block mb-0.5">کل شهریه پرداخت شده:</span>
                    <span className="font-black text-emerald-800 text-base tabular-nums">
                      {stats.totalPaid.toLocaleString('fa-IR')} <span className="text-[10px] font-normal">تومان</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block mb-0.5">مانده بدهی اقساط:</span>
                    <span className={`font-black text-base tabular-nums ${stats.totalRemaining > 0 ? 'text-amber-800' : 'text-stone-700'}`}>
                      {stats.totalRemaining.toLocaleString('fa-IR')} <span className="text-[10px] font-normal">تومان</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block mb-0.5">سفارشات قنادی:</span>
                    <span className="font-black text-purple-900 text-base tabular-nums">
                      {stats.studentOrders.length} سفارش ({stats.ordersTotalSpend.toLocaleString('fa-IR')} ت)
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* SECTION 1: COURSE ENROLLMENTS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-800" />
                  <span>دوره‌های آموزشی ثبت‌نامی هنرجو:</span>
                </h4>

                <button
                  onClick={() => openEnrollNewCourseModal(activeDossierStudent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت‌نام در دوره جدید</span>
                </button>
              </div>

              {(() => {
                const stats = getStudentStats(activeDossierStudent);
                return (
                  <div className="space-y-3">
                    {stats.enrollments.map((enr, idx) => {
                      const remaining = (enr.tuitionTotal || 0) - (enr.tuitionPaid || 0);
                      return (
                        <div
                          key={enr.id || idx}
                          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100">
                            <div>
                              <span className="font-bold text-stone-900 text-sm block">
                                {enr.courseTitle}
                              </span>
                              <span className="text-[11px] text-stone-400 block mt-0.5">
                                تاریخ ثبت‌نام: {enr.enrolledAt}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Certificate toggle button */}
                              <button
                                onClick={() =>
                                  updateStudentEnrollment(activeDossierStudent.id, enr.id, {
                                    certificateIssued: !enr.certificateIssued,
                                  })
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                                  enr.certificateIssued
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{enr.certificateIssued ? 'مدرک صادر شد' : 'مدرک صادر نشده'}</span>
                              </button>

                              {/* Remove enrollment */}
                              <button
                                onClick={() => {
                                  if (confirm(`آیا از حذف این دوره از سوابق هنرجو اطمینان دارید؟`)) {
                                    deleteStudentEnrollment(activeDossierStudent.id, enr.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                                title="حذف این دوره"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Financial row for this course */}
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                            <div>
                              <span className="text-stone-500">شهریه کل: </span>
                              <span className="font-bold text-stone-800 tabular-nums">
                                {(enr.tuitionTotal || 0).toLocaleString('fa-IR')} تومان
                              </span>
                              <span className="mx-2 text-stone-300">|</span>
                              <span className="text-stone-500">پرداختی: </span>
                              <span className="font-bold text-emerald-800 tabular-nums">
                                {(enr.tuitionPaid || 0).toLocaleString('fa-IR')} تومان
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`font-semibold ${
                                  remaining === 0 ? 'text-emerald-700' : 'text-amber-800'
                                }`}
                              >
                                {remaining === 0
                                  ? '✓ تسویه کامل'
                                  : `مانده بدهی: ${remaining.toLocaleString('fa-IR')} تومان`}
                              </span>

                              {/* Quick settle button */}
                              {remaining > 0 && (
                                <button
                                  onClick={() =>
                                    updateStudentEnrollment(activeDossierStudent.id, enr.id, {
                                      tuitionPaid: enr.tuitionTotal,
                                      paymentStatus: 'paid',
                                    })
                                  }
                                  className="px-2.5 py-0.5 rounded text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800"
                                >
                                  تسویه کامل
                                </button>
                              )}
                            </div>
                          </div>

                          {enr.notes && (
                            <p className="text-[11px] text-stone-600 italic">
                              یادداشت استاد / آموزشگاه: {enr.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* SECTION 2: CONFECTIONERY ORDER HISTORY */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Cake className="w-4 h-4 text-purple-700" />
                <span>سوابق سفارشات کیک و دسر (مشتری قنادی):</span>
              </h4>

              {(() => {
                const stats = getStudentStats(activeDossierStudent);
                if (stats.studentOrders.length === 0) {
                  return (
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-400 text-center">
                      این هنرجو تاکنون سفارشی در آتلیه قنادی فندق ثبت نکرده است.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5">
                    {stats.studentOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200">
                              {ord.orderNumber}
                            </span>
                            <span className="font-bold text-stone-900">
                              {ord.items.map((i) => i.product.title).join(' + ')}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-500 flex flex-wrap gap-2">
                            <span>تحویل: {ord.deliveryDate}</span>
                            <span>·</span>
                            <span>آدرس: {ord.deliveryAddress}</span>
                            {ord.items[0]?.selectedFilling && (
                              <>
                                <span>·</span>
                                <span className="text-amber-900 font-medium">فیلینگ: {ord.items[0].selectedFilling}</span>
                              </>
                            )}
                            {ord.items[0]?.cakeText && (
                              <>
                                <span>·</span>
                                <span className="text-stone-700 italic">متن کیک: «{ord.items[0].cakeText}»</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          <span className="font-black text-stone-900 block tabular-nums">
                            {ord.totalAmount.toLocaleString('fa-IR')} تومان
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-0.5 ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status === 'delivered' ? 'تحویل شد' : ord.status === 'in_progress' ? 'در حال پخت' : 'در انتظار'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Dossier Footer */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDossierStudent(null)}
                className="px-5 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                بستن پرونده
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ENROLL IN NEW COURSE (ثبت‌نام هنرجوی موجود در دوره جدید) */}
      {/* ============================================================== */}
      {isEnrollNewCourseModalOpen && targetStudentForNewCourse && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-right">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-sm">
                ثبت‌نام دوره جدید برای: {targetStudentForNewCourse.fullName}
              </h3>
              <button
                onClick={() => setIsEnrollNewCourseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollNewCourseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  دوره آموزشی جدید را انتخاب فرمایید <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => handleNewCourseSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({(c.discountPrice || c.price).toLocaleString('fa-IR')} تومان)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    شهریه این دوره (تومان)
                  </label>
                  <input
                    type="number"
                    value={newCourseTuition}
                    onChange={(e) => setNewCourseTuition(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    پرداختی اولیه (تومان)
                  </label>
                  <input
                    type="number"
                    value={newCoursePaid}
                    onChange={(e) => setNewCoursePaid(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  یادداشت یا نحوه پرداخت اقساط
                </label>
                <input
                  type="text"
                  value={newCourseNotes}
                  onChange={(e) => setNewCourseNotes(e.target.value)}
                  placeholder="مثلاً: تخفیف ۱۰ درصدی وفاداری هنرجو لحاظ گردید"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEnrollNewCourseModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs"
                >
                  افزودن دوره به پرونده
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: ADD NEW STUDENT OR EDIT BASIC INFO */}
      {/* ============================================================== */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto text-right">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingStudent ? 'ویرایش مشخصات فردی هنرجو' : 'ثبت پرونده و هنرجوی جدید در فندق'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOrEditSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  نام و نام خانوادگی هنرجو <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    شماره همراه (واتساپ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    کد ملی
                  </label>
                  <input
                    type="text"
                    value={nationalCode}
                    onChange={(e) => setNationalCode(e.target.value)}
                    placeholder="۰۰۱۲۳۴۵۶۷۸"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs tabular-nums"
                  />
                </div>
              </div>

              {!editingStudent && (
                <>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      دوره اولیه ثبت‌نامی <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={initialCourseId}
                      onChange={(e) => handleInitialCourseSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({(c.discountPrice || c.price).toLocaleString('fa-IR')} تومان)
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      (پس از ثبت، می‌توانید دوره‌های بعدی را نیز به سادگی به پرونده این هنرجو بیافزایید).
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        شهریه کل دوره (تومان)
                      </label>
                      <input
                        type="number"
                        value={initialTuitionTotal}
                        onChange={(e) => setInitialTuitionTotal(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        مبلغ پرداختی تاکنون (تومان)
                      </label>
                      <input
                        type="number"
                        value={initialTuitionPaid}
                        onChange={(e) => setInitialTuitionPaid(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs tabular-nums"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  یادداشت پرونده
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: علاقه‌مند به کارگاه‌های فوندانت و کارآفرینی خانگی"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs"
                >
                  ذخیره اطلاعات
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
