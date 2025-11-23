# Project Name: Apartments Leasing and Management System

## Description:
The Apartments Leasing and Management System is a digital platform designed to streamline rental operations for residential 
properties managed by a leasing office (admin), while providing a modern, user-friendly experience for tenants seeking apartments. 
The application centralizes apartment information, lease management, rent payments, and maintenance coordination, replacing manual workflows 
and fragmented communications with an integrated database system.

## Purpose of the Database:
The system is needed to organize and automate all processes involved in apartment leasing, including property listings, unit details, lease contracts, 
payment tracking, and maintenance management. It will help property staff efficiently manage units and leases, while offering tenants an easy way to 
search, rent, pay, and request repairs—all from a single online portal.

## Users and Their Information Needs:
Admin (Leasing Office Staff): Needs tools to manage property listings, units, leases, payments, tenant accounts, 
and maintenance requests. Requires dashboard summaries, payment reports, unit availability, and communication features.

## Tenants: 
Need to search available apartments, apply for leases, sign contracts, pay rent/deposits, and request maintenance. 
Require visibility into lease status, payment history, and request progress.

## Problems to Be Solved:
Complex, manual tracking of leases, payments, and units.

Delays and errors in maintenance request handling due to paper/email-based workflows.

Lack of a centralized system for tenants to complete leasing tasks online.

Limited visibility for tenants into unit availability and personal lease information.

## Input Data for the Database:
User profiles (admin, tenants)

Property details and images

Unit specifications and availability

Lease contract information (including dates, tenant/unit relationships)

Payment records (rent, deposit, methods, status)

Maintenance requests and statuses

# Stored Information:
User records with roles and credentials

Property descriptions, addresses, and media

Unit features and status (available, leased, maintenance)

Lease agreements (active, expired, terminated)

Payment histories and statuses

Maintenance logs and resolutions

User interactions and queries (for system improvement)

# Key Functions and Operations:
Admin Dashboard: Add/edit properties, upload images, manage unit availability, update leases and payment status, process maintenance requests.

# Tenant Portal: 
Search/filter units, apply for leases, review/sign contracts, execute rent payments, submit maintenance requests, and track request progress.

# Automated Workflow: 
Lease approvals, payment tracking, automated maintenance notifications.

# Role-based Access: 
Admins have full data/control; tenants see only their lease/payments and can submit requests.

# Reporting: 
Lease occupancy rates, payment summaries, maintenance statistics.

# Natural Language Interaction (LLM): 
Includes a chatbot/Q&A interface that allows users to ask questions in plain English, such as "Show available 2-bedroom apartments under $2,000 in Boston", "When is my next rent payment due?", or "Submit a maintenance request for my unit." The system translates queries into database operations and returns relevant results.

# Additional Requirement – LLM Integration:
As part of the project, an LLM-powered chatbot feature will be integrated to improve accessibility and the user experience. This will allow tenants and admins to interact with the system using natural language queries, making the application more approachable for non-technical users and speeding up common tasks.