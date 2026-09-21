import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Book,
    BookOpen,
    AlertTriangle,
    Calendar,
    Clock,
    Search,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

interface Student {
    id: number;
    full_name: string;
    class_name: string;
    section_name: string;
    roll_number: string;
}

interface IssuedBook {
    id: number;
    book_title: string;
    book_author: string;
    isbn: string;
    accession_number: string;
    issue_date: string;
    due_date: string;
    return_date: string | null;
    fine_amount: number;
    status: string;
    is_overdue: boolean;
    days_overdue: number;
}

interface Props {
    student: Student;
    issuedBooks: IssuedBook[];
    summary: {
        currently_issued: number;
        total_returned: number;
        overdue_count: number;
        total_fines: number;
    };
}

export default function Index({ student, issuedBooks, summary }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBooks = issuedBooks.filter(book =>
        book.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.book_author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentBooks = filteredBooks.filter(book => book.status === 'issued');
    const returnedBooks = filteredBooks.filter(book => book.status === 'returned');

    const getStatusBadge = (book: IssuedBook) => {
        if (book.status === 'returned') {
            return <Badge variant="default" className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />Returned</Badge>;
        }

        if (book.is_overdue) {
            return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Overdue ({book.days_overdue} days)</Badge>;
        }

        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Issued</Badge>;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Library - My Books
                </h2>
            }
        >
            <Head title="Library - My Books" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Student Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div>
                                <h3 className="font-semibold text-lg">{student.full_name}</h3>
                                <p className="text-sm text-gray-600">
                                    Class {student.class_name} - {student.section_name} | Roll: {student.roll_number}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Currently Issued</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{summary.currently_issued}</div>
                                <p className="text-xs text-gray-500">Active books</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Returned</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{summary.total_returned}</div>
                                <p className="text-xs text-gray-500">All time</p>
                            </CardContent>
                        </Card>

                        <Card className={summary.overdue_count > 0 ? 'border-red-200 bg-red-50' : ''}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Overdue Books</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${summary.overdue_count > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                    {summary.overdue_count}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {summary.overdue_count > 0 ? 'Return ASAP!' : 'On track'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className={summary.total_fines > 0 ? 'border-orange-200 bg-orange-50' : ''}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Fines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${summary.total_fines > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                                    ৳{summary.total_fines.toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {summary.total_fines > 0 ? 'Pending payment' : 'No fines'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search Bar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Search Books</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by title, author, or ISBN..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Currently Issued Books */}
                    {currentBooks.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                                    Currently Issued Books
                                </CardTitle>
                                <CardDescription>Books you currently have from the library</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {currentBooks.map((book) => (
                                        <div
                                            key={book.id}
                                            className={`p-4 border rounded-lg ${
                                                book.is_overdue ? 'border-red-200 bg-red-50' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <Book className="h-5 w-5 text-blue-600" />
                                                        <h4 className="font-semibold">{book.book_title}</h4>
                                                        {getStatusBadge(book)}
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-3">
                                                        by {book.book_author}
                                                    </p>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <p className="text-gray-600">ISBN</p>
                                                            <p className="font-medium">{book.isbn}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Accession No.</p>
                                                            <p className="font-medium">{book.accession_number}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 flex items-center">
                                                                <Calendar className="mr-1 h-3 w-3" />
                                                                Issue Date
                                                            </p>
                                                            <p className="font-medium">{book.issue_date}</p>
                                                        </div>
                                                        <div>
                                                            <p className={`text-gray-600 flex items-center ${book.is_overdue ? 'text-red-600' : ''}`}>
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                Due Date
                                                            </p>
                                                            <p className={`font-medium ${book.is_overdue ? 'text-red-600' : ''}`}>
                                                                {book.due_date}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {book.is_overdue && (
                                                        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                                                            <AlertTriangle className="inline mr-2 h-4 w-4" />
                                                            This book is overdue by {book.days_overdue} days.
                                                            {book.fine_amount > 0 && ` Fine: ৳${book.fine_amount}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Book History */}
                    {returnedBooks.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Book className="mr-2 h-5 w-5 text-green-600" />
                                    Book History
                                </CardTitle>
                                <CardDescription>Previously borrowed books</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {returnedBooks.map((book) => (
                                        <div
                                            key={book.id}
                                            className="p-4 border rounded-lg bg-gray-50"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="font-semibold">{book.book_title}</h4>
                                                        {getStatusBadge(book)}
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-2">by {book.book_author}</p>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <p className="text-gray-600">Issue Date</p>
                                                            <p className="font-medium">{book.issue_date}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Return Date</p>
                                                            <p className="font-medium">{book.return_date}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">ISBN</p>
                                                            <p className="font-medium">{book.isbn}</p>
                                                        </div>
                                                        {book.fine_amount > 0 && (
                                                            <div>
                                                                <p className="text-gray-600">Fine Paid</p>
                                                                <p className="font-medium text-orange-600">৳{book.fine_amount}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* No Books Found */}
                    {filteredBooks.length === 0 && (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <Book className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        {searchTerm ? 'No books found matching your search' : 'No books issued yet'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
