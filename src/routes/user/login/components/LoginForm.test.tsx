import { render, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { LoginForm } from "./LoginForm";
import { MemoryRouter, Route, Routes } from "react-router-dom";

it('links to password recovery', async () => {
    render(
        <MemoryRouter>
            <Routes>
                <Route index element={<LoginForm />} />
                <Route path="password-recovery" element={<span>password-recovery page</span>} />
            </Routes>
        </MemoryRouter>
    );
    userEvent.click(screen.getByText('Forgotten Password?'));
    await screen.findByText('password-recovery page');
});

it('links to signup', async () => {
    render(
        <MemoryRouter>
            <Routes>
                <Route index element={<LoginForm />} />
                <Route path="signup" element={<span>signup page</span>} />
            </Routes>
        </MemoryRouter>
    );
    userEvent.click(screen.getByText('Sign Up'));
    await screen.findByText('signup page');
})